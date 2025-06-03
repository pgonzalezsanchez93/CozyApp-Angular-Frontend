import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GlobalEventsListComponent } from './components/global-events-list/global-events-list.component';
import { GlobalEventDetailComponent } from './components/global-event-detail/global-event-detail.component';

const routes: Routes = [
  { path: '', component: GlobalEventsListComponent },
  { path: ':id', component: GlobalEventDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GlobalEventsRoutingModule { }
