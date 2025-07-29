import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  pure: true,
  standalone: false,
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string, _trigger: any): string {
    const now = new Date();
    const inputTime = new Date(value);
    const diffInSeconds = Math.floor(
      (now.getTime() - inputTime.getTime()) / 1000,
    );

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return inputTime.toLocaleDateString();
  }
}
