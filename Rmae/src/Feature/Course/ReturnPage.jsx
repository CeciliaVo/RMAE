import { useNavigate } from 'react-router-dom';

export default function ReturnPrePage() {
    const navigate = useNavigate();
    navigate(-1); // This will navigate back in the history stack
}