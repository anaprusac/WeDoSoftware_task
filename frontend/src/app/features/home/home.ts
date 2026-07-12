import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Workout } from '../../core/models/workout.model';
import { WorkoutService } from '../../core/services/workout.service';
import { CalendarModal } from '../calendar/calendar-modal/calendar-modal';
import { WorkoutCard } from '../../shared/components/workout-card/workout-card';

/** Home dashboard (frame 4): add/find actions + the user's workouts, most recent first. */
@Component({
  selector: 'app-home',
  imports: [RouterLink, TranslatePipe, CalendarModal, WorkoutCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly workoutService = inject(WorkoutService);
  private readonly route = inject(ActivatedRoute);

  readonly workouts = signal<Workout[]>([]);
  readonly loaded = signal(false);
  readonly calendarOpen = signal(false);

  constructor() {
    this.workoutService.getRecent().subscribe((workouts) => {
      this.workouts.set(workouts);
      this.loaded.set(true);
    });

    // Lets the hamburger menu's "Find workout" link (?findWorkout=true) open the calendar directly,
    // even when navigating from a route that reuses this same component instance.
    this.route.queryParamMap.subscribe((params) => {
      if (params.get('findWorkout')) {
        this.calendarOpen.set(true);
      }
    });
  }
}
