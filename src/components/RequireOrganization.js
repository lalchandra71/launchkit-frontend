import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { orgAPI } from '../services/api';

const RequireOrganization = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [hasOrg, setHasOrg] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkOrg = async () => {
      try {
        const orgs = await orgAPI.list();
        setHasOrg(orgs && orgs.length > 0);
      } catch (err) {
        setHasOrg(false);
      } finally {
        setLoading(false);
      }
    };
    checkOrg();
  }, []);

  if (loading) {
    return null;
  }

  if (!hasOrg) {
    return <Navigate to="/setup-organization" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireOrganization;
