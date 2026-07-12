import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Workout } from '../../../core/models/workout.model';
import { dateOnlyFromIso, formatDateFromIso, formatDuration } from '../../../core/util/format';
import { WorkoutTypeIcon } from '../workout-type-icon/workout-type-icon';

/** Summary card for the home dashboard (frame 4); the magnifier opens that day's detail. */
@Component({
  selector: 'app-workout-card',
  imports: [RouterLink, TranslatePipe, WorkoutTypeIcon],
  templateUrl: './workout-card.html',
  styleUrl: './workout-card.css',
})
export class WorkoutCard {
  readonly workout = input.required<Workout>();

  readonly dateLabel = computed(() => formatDateFromIso(this.workout().performedAt));
  readonly dateParam = computed(() => dateOnlyFromIso(this.workout().performedAt));
  readonly duration = computed(() => formatDuration(this.workout().durationMinutes));
}
