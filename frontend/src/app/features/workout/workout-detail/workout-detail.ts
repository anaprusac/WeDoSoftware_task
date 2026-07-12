import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Workout } from '../../../core/models/workout.model';
import { WorkoutService } from '../../../core/services/workout.service';
import { formatClockFromIso, formatDateOnly, formatDuration } from '../../../core/util/format';

/** Workout detail by date (frame 9): every workout on the selected day, in chronological order. */
@Component({
  selector: 'app-workout-detail',
  imports: [TranslatePipe],
  templateUrl: './workout-detail.html',
  styleUrl: './workout-detail.css',
})
export class WorkoutDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly workoutService = inject(WorkoutService);

  readonly date = this.route.snapshot.paramMap.get('date') ?? '';
  readonly dateLabel = this.date ? formatDateOnly(this.date) : '';
  readonly workouts = signal<Workout[]>([]);
  readonly loaded = signal(false);

  constructor() {
    if (this.date) {
      this.workoutService.getByDate(this.date).subscribe((workouts) => {
        this.workouts.set(workouts);
        this.loaded.set(true);
      });
    } else {
      this.loaded.set(true);
    }
  }

  time(workout: Workout): string {
    return formatClockFromIso(workout.performedAt);
  }

  duration(workout: Workout): string {
    return formatDuration(workout.durationMinutes);
  }
}
