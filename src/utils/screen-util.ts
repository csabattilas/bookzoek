export class ScreenUtil {

  static getKey(availWidth: number) {
    if (availWidth < 600) {
      return 'S'
    } else if (availWidth > 600 && availWidth < 1024) {
      return 'M';
    } else {
      return 'L'
    }
  }
}