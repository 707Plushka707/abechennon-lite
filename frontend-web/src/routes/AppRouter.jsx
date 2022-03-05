import React, { useEffect } from 'react';
import {
    BrowserRouter as Router,
    // Switch,
    Route,
    Routes,
    Navigate,
    BrowserRouter
  } from 'react-router-dom';
  
// import { useDispatch, useSelector } from 'react-redux';

import { HomeScreen } from '../components/home/HomeScreen';
import { ConfigScreen } from '../components/config/ConfigScreen';
import { NewsScreen } from '../components/news/NewsScreen';
// import { ChartScreen } from '../components/chart/ChartScreen';
// import { LoginScreen } from '../components/auth/LoginScreen';
// import { ExampleScreen1 } from '../components/example1/ExampleScreen1';
// import { UsersScreen } from '../components/user/UsersScreen';
// import { TodoList } from '../components/todo/TodoList';
// import { TodoItem } from '../components/todo/TodoItem';
import { CountScreen } from '../components/count/CountScreen';
import { NotFoundScreen } from '../components/notFound/NotFoundScreen';


// import { LoginScreen } from '../components/auth/LoginScreen';
// import { CalendarScreen } from '../components/calendar/CalendarScreen';
// import { startChecking } from '../actions/auth';
// import { PublicRoute } from './PublicRoute';
// import { PrivateRoute } from './PrivateRoute';


export const AppRouter = () => {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/dashboard" element={<HomeScreen />} />
                <Route path="/config" element={<ConfigScreen />} />
                <Route path="/news" element={<NewsScreen />} />
                {/* <Route path="/chart*" element={<ChartScreen />} /> */}
                {/* <Route path="/login*" element={<LoginScreen />} /> */}
                {/* <Route path="/recovery-password" element={RecoveryPasswordScreen} /> */}
                {/* <Route path="users/*" element={<UsersScreen />} /> */}
                {/* <Route path="/example1*" element={<ExampleScreen1 />} /> */}
                {/* <Route path="/todo*" element={<TodoList />} /> */}
                <Route path="/count*" element={<CountScreen />} />
				<Route path="*" element={<NotFoundScreen />} />
            </Routes>
        </BrowserRouter>
    )
}