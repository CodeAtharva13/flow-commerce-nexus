
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  return (
    <div className="auth-container">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-bold text-center">Flow Commerce</h1>
        <p className="text-center text-muted-foreground mb-6">
          Sign in to your account
        </p>
      </div>
      <LoginForm />
    </div>
  );
};

export default Login;
