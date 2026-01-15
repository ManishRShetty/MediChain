import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewtrailComponent } from './viewtrail.component';

describe('ViewtrailComponent', () => {
  let component: ViewtrailComponent;
  let fixture: ComponentFixture<ViewtrailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewtrailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewtrailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
