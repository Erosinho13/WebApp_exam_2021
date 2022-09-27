function Logo(props) {
  return (
    <svg className='bi bi-check-all' width={props.size} height={props.size} viewBox='0 0 16 16' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
      <path d='M3.5 15a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm9-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm0 9a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zM16 3.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0zm-9 9a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0zm5.5 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm-9-11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 2a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z'/>
    </svg>
  );
}

function Plus(props) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={props.size} height={props.size} fill='currentColor' className='bi bi-plus-lg' viewBox='0 0 16 16'>
      <path d='M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 0 1 0-2h6V1a1 1 0 0 1 1-1z'/>
    </svg>
  );
}

function Minus(props) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={props.size} height={props.size} fill='currentColor' className='bi bi-dash-lg' viewBox='0 0 16 16'>
      <path d='M0 8a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1z'/>
    </svg>
  );
}

function Up(props) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={props.size} height={props.size} fill='currentColor' className='bi bi-caret-up-fill' viewBox='0 0 16 16'>
      <path d='m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z'/>
    </svg>
  );
}

function Right(props) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={props.size} height={props.size} fill='currentColor' className='bi bi-caret-right-fill' viewBox='0 0 16 16'>
      <path d='m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z'/>
    </svg>
  );
}

function Down(props) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={props.size} height={props.size} fill='currentColor' className='bi bi-caret-down-fill' viewBox='0 0 16 16'>
      <path d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/>
    </svg>
  );
}

function Left(props) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={props.size} height={props.size} fill='currentColor' className='bi bi-caret-left-fill' viewBox='0 0 16 16'>
      <path d='m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z'/>
    </svg>
  );
}

function Bin (props) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width={props.size} height={props.size} fill='currentColor' className='bi bi-trash-fill' viewBox='0 0 16 16'>
      <path d='M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z'/>
    </svg>
  );
}

export {Logo, Plus, Minus, Up, Right, Down, Left, Bin};