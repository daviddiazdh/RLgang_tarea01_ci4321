import './style.css';
import { run as runFF } from './examples/figures';
import { Figure, FixedColor} from './examples/types'


type Param = 'figure' | 'color';

const FIGURE_ARRAY : Array<Figure> = ['TRIANGLE', 'SQUARE', 'HEXAGON', 'CIRCLE'];
let FIGURE_ARRAY_INDEX = 0;

const COLOR_ARRAY : Array<FixedColor> = ['RED', 'GREEN', 'BLUE'];
let COLOR_ARRAY_INDEX = 0;


const stage = document.getElementById('stage')!;

const buttons: Record<Param, HTMLElement> = {
  figure: document.getElementById('btn-figure')!, 
  color: document.getElementById('btn-color')!
};

function show(figure: Figure, color: FixedColor): void {
  // A fresh canvas gives a fresh WebGL context, so no state leaks between versions.
  const canvas = document.createElement('canvas');
  stage.replaceChildren(canvas);
  runFF(canvas, figure, color);
}

buttons.figure.addEventListener('click', function () {
  FIGURE_ARRAY_INDEX = (FIGURE_ARRAY_INDEX + 1) % FIGURE_ARRAY.length;
  let current_figure = FIGURE_ARRAY[FIGURE_ARRAY_INDEX];
  this.textContent = `Figure: ${current_figure}`; 
  show(current_figure, COLOR_ARRAY[COLOR_ARRAY_INDEX]);
});

buttons.color.addEventListener('click', function () {
  COLOR_ARRAY_INDEX = (COLOR_ARRAY_INDEX + 1) % COLOR_ARRAY.length;
  let current_color = COLOR_ARRAY[COLOR_ARRAY_INDEX];
  this.textContent = `Color: ${current_color}`; 
  show(FIGURE_ARRAY[FIGURE_ARRAY_INDEX], COLOR_ARRAY[COLOR_ARRAY_INDEX]);
});

show(FIGURE_ARRAY[FIGURE_ARRAY_INDEX], COLOR_ARRAY[COLOR_ARRAY_INDEX]);
