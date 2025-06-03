import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalEventDetailComponent } from './components/global-event-detail/global-event-detail.component';
import { GlobalEventFormComponent } from './components/global-event-form/global-event-form.component';
import { GlobalEventsListComponent } from './components/global-events-list/global-events-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { GlobalEventsRoutingModule } from './global-events-routing.module';
import { GlobalEventService } from './services/global-event.service';

@NgModule({
   declarations: [
    GlobalEventsListComponent,
    GlobalEventDetailComponent,
    GlobalEventFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GlobalEventsRoutingModule,
    MaterialModule,
    SharedModule
  ],
  providers: [
    GlobalEventService
  ],
  exports: [
    GlobalEventFormComponent,
    GlobalEventsListComponent,
    GlobalEventDetailComponent
  ]
})
export class GlobalEventsModule { }
