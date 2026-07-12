import { Component, input } from '@angular/core';
import { WorkoutType } from '../../../core/models/workout.model';

/** Small line-icon glyph representing a workout type, used anywhere a workout's type is shown. */
@Component({
  selector: 'app-workout-type-icon',
  imports: [],
  templateUrl: './workout-type-icon.html',
  styleUrl: './workout-type-icon.css',
})
export class WorkoutTypeIcon {
  readonly type = input.required<WorkoutType>();
}
