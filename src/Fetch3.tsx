// Вывести список планет
// https://pokeapi.co/api/v2/pokemon/
// GET https://swapi.tech/api/planets/

// Пример ответа:
import "./App.css";
import { useState, useEffect } from "react";
import { fetchPlanetListService } from "./services/planetService";




// {

//   "message": "ok",
//   "total_records": 60,
//   "total_pages": 6,
//   "previous": null,
//   "next": "https://swapi.tech/api/planets?page=2&limit=10",
//   "results": [
//     {
//       "uid": "1",
//       "name": "Tatooine",
//       "url": "https://swapi.tech/api/planets/1"
//     }
//   ]
// }

// Типы для TypeScript:
type Planet = {
  uid: string;
  name: string;
  url: string;
}

type Response = {
  message: string;
  total_records: number;
  total_pages: number;
  previous: string | null;
  next: string;
  results: Planet[];
}



export default function App() {

    const [planets, setPlanets] = useState<Planet[]>([])
    const [loading, setLoading] = useState(true)
     const [error, setError] = useState(false)

async function getPlanets(){
    try{

        const response = await fetchPlanetListService()
        setPlanets(response.results)
    }
    catch(e){
       console.log(e)
       setError(error)

    }
    finally{
        setLoading(false)
    }
}


useEffect(()=>{


getPlanets()
}, [])

if(loading){
    return <div>Загрузка....</div>
}
if(error){
    return <div>Ошибка. Попробуйте позже....</div>
}

  return (
    <main>
      <h1>Список планет</h1>
      <ul>
        
       <button onClick={getPlanets}>Обновить список</button> {/* Кнопка для обновления */}
      {planets.map((planet)=>(
        <li key = {planet.uid}>{planet.name}</li>

      ))}
      </ul>
    </main>
  );
}
