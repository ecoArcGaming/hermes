// src/app/timestamp.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

//  gRPC timestamp structure
interface GrpcTimestamp {
  seconds: number;
  nanos: number;
}

@Pipe({
  name: 'timestamp',
  standalone: true
})
export class TimestampPipe implements PipeTransform {
  transform(value: GrpcTimestamp | undefined): Date | null {
    if (!value) {
      return null;
    }
    return new Date(value.seconds * 1000);
  }
}