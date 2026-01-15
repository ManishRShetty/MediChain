import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleBasedComponent } from './role-based.component';

describe('RoleBasedComponent', () => {
  let component: RoleBasedComponent;
  let fixture: ComponentFixture<RoleBasedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleBasedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleBasedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
