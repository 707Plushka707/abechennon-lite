import { useState, useEffect } from 'react';


export const useCount = () => {
  // Similar a componentDidMount y componentDidUpdate:
//   useEffect(() => {
//     // Actualiza el título del documento usando la Browser API
//     document.title = `You clicked ${count} times`;
//   });

  const [count, setCount] = useState(0);

  return [count , setCount]
};