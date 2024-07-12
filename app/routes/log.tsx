export async function loader({ request }: LoaderFunctionArgs) {
    const userId = await getUserId(request);
    if (userId) {
      console.log('loader /login : redirecting to /dashboard');
      return redirect('/dashboard');
    }
    console.log('loader /login : returning {}');
    return {};
  }
  
  export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');
    if (!email || !password) return json({ error: 'Please fill all form fields' });
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new Error('Invalid form data');
    }
    try {
      const user = await loginUser({ email, password });
      return redirect('/dashboard', { headers: await createUserSession(user) });
    } catch (error: any) {
      return json({ error: error?.message || 'Something went wrong' });
    }
  }