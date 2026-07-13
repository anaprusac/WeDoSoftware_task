import { AfterViewChecked, Component, ElementRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Workout } from '../../../core/models/workout.model';
import { WorkoutService } from '../../../core/services/workout.service';
import { formatClockFromIso, formatDateOnly, formatDuration } from '../../../core/util/format';
import { WorkoutTypeIcon } from '../../../shared/components/workout-type-icon/workout-type-icon';

/** Workout detail by date (frame 9): every workout on the selected day, in chronological order. */
@Component({
  selector: 'app-workout-detail',
  imports: [TranslatePipe, WorkoutTypeIcon],
  templateUrl: './workout-detail.html',
  styleUrl: './workout-detail.css',
})
export class WorkoutDetail implements AfterViewChecked {
  private readonly route = inject(ActivatedRoute);
  private readonly workoutService = inject(WorkoutService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly date = this.route.snapshot.paramMap.get('date') ?? '';
  readonly dateLabel = this.date ? formatDateOnly(this.date) : '';
  /** Set from ?highlight=<id> (e.g. arriving from the home dashboard's magnifier) so the specific
   * workout the user came here for is immediately obvious instead of lost in the day's full list. */
  readonly highlightId = this.route.snapshot.queryParamMap.get('highlight');
  readonly workouts = signal<Workout[]>([]);
  readonly loaded = signal(false);

  private scrolledToHighlight = false;

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

  ngAfterViewChecked(): void {
    if (this.scrolledToHighlight || !this.highlightId || !this.loaded()) {
      return;
    }
    const target = this.elementRef.nativeElement.querySelector(`[data-workout-id="${this.highlightId}"]`);
    if (target) {
      this.scrolledToHighlight = true;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  time(workout: Workout): string {
    return formatClockFromIso(workout.performedAt);
  }

  duration(workout: Workout): string {
    return formatDuration(workout.durationMinutes);
  }
}
