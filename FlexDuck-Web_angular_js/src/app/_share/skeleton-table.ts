import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'skeleton-table-display',
  template: `
    <div class="table-responsive">
      <table class="table table-condensed table-hover">
        <thead>
          <tr>
            <th>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </th>
            <th>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </th>
            <th>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </th>
            <th>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </th>
            <th>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </th>
            <th>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </th>
            <th>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </th>
            <th>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </th>
            <th>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </th>
            <th>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let skeletons of range(8)">
            <td>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </td>
            <td>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </td>
            <td>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </td>
            <td>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </td>
            <td>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </td>
            <td>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </td>
            <td>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </td>
            <td>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </td>
            <td>
              <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </td>
            <td style="display: flex; flex-direction: column;">
            <p class="placeholder-glow">
                <span class="card-text placeholder col-12"></span>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class SkeletonTableDisplay implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  // Controlamos o loop criando um array de nº.
  range(count: number): number[] {
    return Array.from({ length: count }, (skeletons, i) => i);
  }
}
