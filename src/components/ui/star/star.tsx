import './star.css';

export default function Star({ earned=true, locked=false }: { earned?: boolean; locked?: boolean }) {
  let className = earned ? "star fa-solid fa-star" : "star fa-regular fa-star";
  if (locked) {
    className += " locked";
  }
  return (
    <i className={className}></i>
  )
}