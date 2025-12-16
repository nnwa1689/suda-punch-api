import { Injectable } from '@nestjs/common';
import * as geolib from 'geolib';
import moment from 'moment';

@Injectable()
export class GeoService {
    /**
   * 使用 Haversine 公式計算兩點間距離
   * @param point1 點 A { latitude, longitude }
   * @param point2 點 B { latitude, longitude }
   * @returns 距離 (公尺)
   */
  calculateDistance(point1: { latitude: number, longitude: number }, point2: { latitude: number, longitude: number }): number {
    // geolib.getDistance 的第三個參數為精度，1 表示以公尺為單位
    return geolib.getDistance(point1, point2, 1); 
  }

  getSystemTime(): Date {
      const now = new Date();
      return moment(now).utcOffset(8).toDate();
  }
}
