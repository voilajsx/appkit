import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from '@/pages/Home';
import GettingStarted from '@/pages/GettingStarted'; 
import Overview from '@/pages/Overview'; 
import AuthOverview from '@/pages/modules/AuthOverview'; 
import CacheOverview from '@/pages/modules/CacheOverview';
import ConfigOverview from '@/pages/modules/ConfigOverview';
import LoggingOverview from '@/pages/modules/LoggingOverview';
import ValidationOverview from '@/pages/modules/ValidationOverview';
import ErrorOveriew from '@/pages/modules/ErrorOverview';
import SecurityOverview from '@/pages/modules/SecurityOverview';
import Documentation from '@/pages/Documentation';
import ModuleIndex from '@/pages/ModuleIndex';
import DocPage from '@/pages/DocPage';
import NotFound from '@/pages/NotFound';

/**
 * Application router configuration for @voilajsx/appkit documentation site
 * Defines all routes and their corresponding components
 */
function AppRouter() {
  // For debugging purposes - helps to verify routes are working correctly
  const location = useLocation();
  React.useEffect(() => {
    console.log('Current path:', location.pathname);
  }, [location]);

  return (
    <Routes>
      {/* Home page */}
      <Route path="/" element={<Home />} />
      
      {/* Documentation routes */}
      <Route path="/docs" element={<Documentation />}>
        {/* Default documentation landing page */}
        <Route index element={<GettingStarted />} />
        
        {/* General documentation pages */}
        <Route path="getting-started" element={<GettingStarted />} />
        <Route path="overview" element={<Overview />} />
        <Route path="auth" element={<AuthOverview />} />
        <Route path="cache" element={<CacheOverview />} />
        <Route path="config" element={<ConfigOverview />} />
        <Route path="logging" element={<LoggingOverview />} />
        <Route path="security" element={<SecurityOverview />} />
        <Route path="validation" element={<ValidationOverview />} />
        <Route path="error" element={<ErrorOveriew />} />
        
        {/* Module index pages */}
        <Route path="auth" element={<ModuleIndex module="auth" />} />
        <Route path="logging" element={<ModuleIndex module="logging" />} />
        
        {/* Module documentation - specific pages */}
        <Route path="auth/:doc" element={<DocPage module="auth" />} />
        <Route path="logging/:doc" element={<DocPage module="logging" />} />
      </Route>
      
      {/* 404 - Not Found for any other routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRouter;