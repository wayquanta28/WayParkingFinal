import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkFeedbackComponent } from './bulk-feedback.component';

describe('BulkFeedbackComponent', () => {
  let component: BulkFeedbackComponent;
  let fixture: ComponentFixture<BulkFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BulkFeedbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
