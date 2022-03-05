import React,{useState, useEffect } from 'react';

const API_URL = "https://newsapi.org/v2/everything?q=usa&apiKey=5cd144838ca946889defee138c4c3d8e"; // <- API_KEY inlined in the url

// const API_KEY = process.env.REACT_APP_API_KEY
// const API_URL = "https://newsapi.org/v2/everything?q=usa&apiKey=${API_KEY}"

function App(){

    const [newsList, setNewsList] = useState([]);

    useEffect(() => {          
        getNews(); 
    }, []);   

    const getNews = () => {      
        fetch(API_URL)        
        .then(response => response.json())              
        .then(data => setNewsList([...data])
    
        
    return (
        <div>
            { newsList.map( item => <p key={Math.random()}>{item.headline.title}</p> )} 
        </div>)
};


function App(){
    const [newsList, setNewsList] = useState([]);
    useEffect(() => {
            getNews();
 }, []);
   const getNews = () => {
      fetch(API_URL)
          .then(response => response.json())    
          .then(data => setNewsList([...data])
}
 
return (
   <div>
    {/* { newsList.map( item => <p key={Math.random()}>{item.headline.title}</p> )} */}
    <title>%REACT_APP_API_KEY%</title>
  </div>
)
;}