// src/employee/employee-schedule/employee-schedule-batch.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { EmployeeSchedule } from '../../database/entities/employee-schedule.entity';
import { ShiftTemplate } from '../../database/entities/shift-template.entity';
import { Employee } from '../../database/entities/employee.entity';
import { Department } from '../../database/entities/department.entity';
import { BatchScheduleDto } from '../../database/dto/batch-schedule.dto';

@Injectable()
export class EmployeeScheduleBatchService {
  constructor(
    @InjectRepository(EmployeeSchedule)
    private scheduleRepository: Repository<EmployeeSchedule>,
    @InjectRepository(ShiftTemplate)
    private templateRepository: Repository<ShiftTemplate>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  /**
   * 批次匯入一個月的月曆式班表：先驗證全部資料，任何一筆有誤則整批不匯入
   * 循環班別寫入該月 1 號一筆 (fixed)；逐日班別每天各一筆 (daily，優先於循環班別)
   * @param dto
   * @returns 匯入筆數
   */
  async importSchedules(dto: BatchScheduleDto): Promise<{ rowCount: number; scheduleCount: number }> {
    const monthStart = moment(`${dto.month}-01`, 'YYYY-MM-DD', true);
    if (!monthStart.isValid()) {
      throw new BadRequestException('匯入月份格式必須為 YYYY-MM。');
    }
    const firstDay = monthStart.format('YYYY-MM-DD');
    const lastDay = monthStart.clone().endOf('month').format('YYYY-MM-DD');
    const daysInMonth = monthStart.daysInMonth();
    const dateOf = (day: number) => monthStart.clone().date(day).format('YYYY-MM-DD');

    const rows = dto.rows.map((row) => ({
      departmentId: row.departmentId.trim(),
      employeeId: row.employeeId.trim(),
      cyclic: (row.cyclicShiftTemplateId ?? '').trim(),
      days: row.days.map((code) => code.trim()),
    }));

    // 一次撈出所有會用到的資料，避免逐筆查詢
    const employeeIds = [...new Set(rows.map((r) => r.employeeId).filter(Boolean))];
    const templateIds = [...new Set(rows.flatMap((r) => [r.cyclic, ...r.days]).filter(Boolean))];
    const [departments, employees, templates, existingSchedules] = await Promise.all([
      this.departmentRepository.find(),
      employeeIds.length ? this.employeeRepository.find({ where: { id: In(employeeIds) } }) : Promise.resolve([]),
      templateIds.length ? this.templateRepository.find({ where: { id: In(templateIds) } }) : Promise.resolve([]),
      // 該月已存在的排班，用於衝突檢查
      employeeIds.length
        ? this.scheduleRepository.find({
            where: { employee_id: In(employeeIds), schedule_date: Between(firstDay, lastDay) as any },
          })
        : Promise.resolve([]),
    ]);
    const employeeMap = new Map(employees.map((e) => [e.id, e]));
    const templateMap = new Map(templates.map((t) => [t.id, t]));

    const errors: string[] = [];
    const seenEmployees = new Set<string>();

    rows.forEach((row, index) => {
      const label = `第 ${index + 1} 筆`;
      if (!row.departmentId || !row.employeeId) {
        errors.push(`${label}：部門與員工編號皆為必填。`);
        return;
      }

      // 部門可填代碼或名稱
      const department = departments.find((d) => d.id === row.departmentId || d.name === row.departmentId);
      if (!department) {
        errors.push(`${label}：部門 ${row.departmentId} 不存在。`);
      }

      const employee = employeeMap.get(row.employeeId);
      if (!employee) {
        errors.push(`${label}：員工編號 ${row.employeeId} 不存在。`);
      } else if (!employee.is_active) {
        errors.push(`${label}：員工 ${row.employeeId} 已停用。`);
      } else if (department && employee.department_id !== department.id) {
        errors.push(`${label}：員工 ${row.employeeId} 不屬於部門 ${row.departmentId}。`);
      }

      if (seenEmployees.has(row.employeeId)) {
        errors.push(`${label}：員工 ${row.employeeId} 在匯入檔案中重複，每位員工僅能一列。`);
      }
      seenEmployees.add(row.employeeId);

      // 班別代碼檢查
      const checkTemplate = (code: string, where: string) => {
        const template = templateMap.get(code);
        if (!template) {
          errors.push(`${label}：${where}班別代碼 ${code} 不存在。`);
        } else if (!template.is_active) {
          errors.push(`${label}：${where}班別 ${code} 已停用。`);
        }
      };
      if (row.cyclic) checkTemplate(row.cyclic, '循環');

      const overflowDays: number[] = [];
      row.days.forEach((code, i) => {
        if (!code) return;
        const day = i + 1;
        if (day > daysInMonth) {
          overflowDays.push(day);
        } else {
          checkTemplate(code, `${day} 日`);
        }
      });
      if (overflowDays.length > 0) {
        errors.push(`${label}：${dto.month} 只有 ${daysInMonth} 天，${overflowDays.join('、')} 日不可填寫班別。`);
      }

      const hasDaily = row.days.some((code, i) => code && i < daysInMonth);
      if (!row.cyclic && !hasDaily) {
        errors.push(`${label}：員工 ${row.employeeId} 未指定任何班別。`);
      }

      // 與既有排班衝突
      const ownSchedules = existingSchedules.filter((s) => s.employee_id === row.employeeId);
      if (row.cyclic && ownSchedules.some((s) => s.schedule_type === 'fixed')) {
        errors.push(`${label}：員工 ${row.employeeId} 在 ${dto.month} 月份已有循環班別排班。`);
      }
      const existingDailyDates = new Set(
        ownSchedules.filter((s) => s.schedule_type === 'daily').map((s) => moment(s.schedule_date).format('YYYY-MM-DD')),
      );
      const conflictDays = row.days
        .map((code, i) => (code && i < daysInMonth && existingDailyDates.has(dateOf(i + 1)) ? i + 1 : null))
        .filter((day): day is number => day !== null);
      if (conflictDays.length > 0) {
        errors.push(`${label}：員工 ${row.employeeId} 在 ${conflictDays.join('、')} 日已有排班。`);
      }
    });

    if (errors.length > 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: `資料驗證失敗，共 ${errors.length} 項錯誤，整批未匯入。`,
        error: 'Bad Request',
        errors,
      });
    }

    const now = new Date();
    const newSchedule = (employeeId: string, date: string, templateId: string, type: 'fixed' | 'daily') =>
      this.scheduleRepository.create({
        id: uuidv4(),
        employee_id: employeeId,
        schedule_date: date as any,
        shift_template_id: templateId,
        schedule_type: type,
        created_at: now,
        updated_at: now,
      });

    const schedules = rows.flatMap((row) => [
      ...(row.cyclic ? [newSchedule(row.employeeId, firstDay, row.cyclic, 'fixed')] : []),
      ...row.days
        .slice(0, daysInMonth)
        .flatMap((code, i) => (code ? [newSchedule(row.employeeId, dateOf(i + 1), code, 'daily')] : [])),
    ]);

    // 使用交易確保整批寫入的原子性
    await this.scheduleRepository.manager.transaction(async (manager) => {
      await manager.save(EmployeeSchedule, schedules, { chunk: 500 });
    });

    return { rowCount: rows.length, scheduleCount: schedules.length };
  }
}
