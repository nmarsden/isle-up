import './star.css';

export default function Star({ earned=true }: { earned?: boolean }) {
  return (
    <i className={earned ? "star fa-solid fa-star" : "star fa-regular fa-star"}></i>
  )
}