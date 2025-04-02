
import RegisterForm from '../components/auth/RegisterForm';

const Register = () => {
  return (
    <div className="auth-container">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-bold text-center">Flow Commerce</h1>
        <p className="text-center text-muted-foreground mb-6">
          Create a new account
        </p>
      </div>
      <RegisterForm />
    </div>
  );
};

export default Register;
