import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../../shared/shared.module";
import { PomodoroComponent } from "./pomodoro/pomodoro.component";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    PomodoroComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: PomodoroComponent
      }
    ])
  ]
})
export class PomodoroModule { }
