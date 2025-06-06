// Debug environment variables
export const debugEnv = () => {
  console.log('=== Environment Debug ===');
  console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
  console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Not set');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('All env vars starting with REACT_APP:', 
    Object.keys(process.env)
      .filter(key => key.startsWith('REACT_APP'))
      .join(', ')
  );
  console.log('======================');
};