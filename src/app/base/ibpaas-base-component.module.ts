import { NgModule } from '@angular/core';
import { BackDirective } from './directives/back.directive';
import { CancelEditableRowDirective, DeleteEditableRowDirective, EditableColumnDirective, EditableTableDirective, SaveEditableRowDirective } from './directives/editable-table.directive';
import { DynamicDecimalPipe } from './pipes/dynamic-decimal.pipe';

@NgModule({
  declarations: [
    BackDirective,
    EditableTableDirective,
    EditableColumnDirective,
    SaveEditableRowDirective,
    CancelEditableRowDirective,
    DeleteEditableRowDirective,
    DynamicDecimalPipe
  ],
  imports: [

  ],
  exports: [
    BackDirective,
    EditableTableDirective,
    EditableColumnDirective,
    SaveEditableRowDirective,
    CancelEditableRowDirective,
    DeleteEditableRowDirective,
    DynamicDecimalPipe
  ]
})
export class IbpaasBaseComponentModule { }
