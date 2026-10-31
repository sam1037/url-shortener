import { useState } from 'react';

export function CounterButton() {
	const [count, setCount] = useState(0);

	return (
		<button onClick={() => setCount((c) => c + 1)}>Clicked: {count}</button>
	);
}
