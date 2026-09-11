import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import PasswordInput from '../components/common/PasswordInput';
import Button from '../components/common/Button';
import Stepper from '../components/common/Stepper';
import ThemeToggle from '../components/common/ThemeToggle';
import DocumentUpload from '../components/provider/DocumentUpload';
import CategoryPicker from '../components/provider/CategoryPicker';
import GoogleAuthButton from '../components/common/GoogleAuthButton';
import { updateProfileApi, submitApplicationApi } from '../api/provider.api';
import { suggestCategoriesApi } from '../api/ai.api';
import { SERVICE_CATEGORIES } from '../utils/constants';
import { SERVICE_ICONS } from '../utils/serviceIcons';

const STEPS = ['Basic Info', 'Services', 'Location', 'Documents'];

const BasicInfoStep = ({ onNext, loading }) => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleAuthenticated = (user) => {
    if (user.role === 'admin' || user.providerProfile?.status !== 'incomplete') {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      onNext();
    }
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await registerUser(values);
      onNext();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-4">
        <GoogleAuthButton onAuthenticated={handleGoogleAuthenticated} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Input
          label="Email Address"
          type="email"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Input
          label="Phone Number"
          error={errors.phone?.message}
          {...register('phone', { required: 'Phone is required' })}
        />
        <PasswordInput
          label="Password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'At least 6 characters' },
          })}
        />
        <PasswordInput
          label="Confirm Password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => value === watch('password') || 'Passwords do not match',
          })}
        />
        <Button type="submit" loading={submitting || loading} className="mt-2 w-full">
          Next
        </Button>
      </form>
    </>
  );
};

const ServicesStep = ({ data, onChange, onNext, onBack }) => {
  const [skillInput, setSkillInput] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [suggestCategory, setSuggestCategory] = useState('');
  const [suggesting, setSuggesting] = useState(false);

  const toggleCategory = (category) => {
    const next = data.categories.includes(category)
      ? data.categories.filter((c) => c !== category)
      : [...data.categories, category];
    onChange({ ...data, categories: next });
  };

  const handleAiSuggest = async () => {
    if (!workDescription.trim() && !suggestCategory) {
      toast.error('Describe your work or pick a category first');
      return;
    }
    setSuggesting(true);
    try {
      const { data: result } = await suggestCategoriesApi(workDescription.trim(), suggestCategory || undefined);
      const { categories: suggestedCategories, skills: suggestedSkills } = result.data;
      onChange({
        ...data,
        categories: [...new Set([...data.categories, ...suggestedCategories])],
        skills: [...new Set([...data.skills, ...suggestedSkills])],
      });
      toast.success('Suggestions added below — review and adjust as needed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI suggestion failed');
    } finally {
      setSuggesting(false);
    }
  };

  const addSkill = (e) => {
    if (e.key !== 'Enter' || !skillInput.trim()) return;
    e.preventDefault();
    if (!data.skills.includes(skillInput.trim())) {
      onChange({ ...data, skills: [...data.skills, skillInput.trim()] });
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => onChange({ ...data, skills: data.skills.filter((s) => s !== skill) });

  const handleNext = () => {
    if (!data.categories.length) return toast.error('Select at least one service category');
    if (!data.skills.length && !skillInput.trim()) {
      return toast.error('Add at least one skill (type it and press Enter)');
    }
    if (skillInput.trim() && !data.skills.includes(skillInput.trim())) {
      onChange({ ...data, skills: [...data.skills, skillInput.trim()] });
      setSkillInput('');
    }
    onNext();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-dashed border-primary-200 bg-primary-50/40 p-3 dark:border-primary-500/30 dark:bg-primary-500/5">
        <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">✨ Suggest with AI</h3>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          Describe what you do, optionally narrow it to a category, and AI will suggest skills below.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={workDescription}
            onChange={(e) => setWorkDescription(e.target.value)}
            placeholder="e.g. I fix leaky pipes and install water heaters"
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          <div className="relative">
            {suggestCategory && (
              <img
                src={SERVICE_ICONS[suggestCategory]}
                alt=""
                className="pointer-events-none absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full object-cover"
              />
            )}
            <select
              value={suggestCategory}
              onChange={(e) => setSuggestCategory(e.target.value)}
              className={`rounded-lg border border-gray-300 bg-white py-2 pr-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 ${
                suggestCategory ? 'pl-8' : 'pl-3'
              }`}
            >
              <option value="">Any category</option>
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" variant="secondary" loading={suggesting} onClick={handleAiSuggest}>
            Suggest
          </Button>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">Select Service Categories</h3>
        <CategoryPicker selected={data.categories} onToggle={toggleCategory} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">Skills</h3>
        <input
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={addSkill}
          placeholder="Type a skill and press Enter"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {data.skills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      <Input
        label="Years of Experience"
        type="number"
        min="0"
        value={data.experienceYears}
        onChange={(e) => onChange({ ...data, experienceYears: e.target.value })}
      />

      <div className="mt-2 flex justify-between">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

const LocationStep = ({ data, onChange, onNext, onBack, loading }) => {
  const handleNext = () => {
    if (!data.city.trim()) return toast.error('City is required');
    onNext();
  };

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Address"
        value={data.address}
        onChange={(e) => onChange({ ...data, address: e.target.value })}
      />
      <Input label="City" value={data.city} onChange={(e) => onChange({ ...data, city: e.target.value })} />
      <Input label="State" value={data.state} onChange={(e) => onChange({ ...data, state: e.target.value })} />
      <Input
        label="Pincode"
        value={data.pincode}
        onChange={(e) => onChange({ ...data, pincode: e.target.value })}
      />
      <div className="mt-2 flex justify-between">
        <Button type="button" variant="secondary" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button type="button" onClick={handleNext} loading={loading}>
          Next
        </Button>
      </div>
    </div>
  );
};

const DocumentsStep = ({ profile, setProfile, onBack, navigate }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    try {
      await submitApplicationApi();
      toast.success('Application submitted for review!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Please upload the required documents');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DocumentUpload profile={profile} onProfileChange={setProfile} readOnly={false} />
      <div className="flex justify-between">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="button" loading={submitting} onClick={handleSubmitApplication}>
          Submit for Review
        </Button>
      </div>
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [savingStep3, setSavingStep3] = useState(false);
  const [servicesData, setServicesData] = useState({ categories: [], skills: [], experienceYears: '' });
  const [locationData, setLocationData] = useState({ address: '', city: '', state: '', pincode: '' });
  const [profile, setProfile] = useState(null);

  const handleLocationNext = async () => {
    setSavingStep3(true);
    try {
      const { data } = await updateProfileApi({
        categories: servicesData.categories,
        skills: servicesData.skills,
        experienceYears: Number(servicesData.experienceYears) || 0,
        location: locationData,
      });
      setProfile(data.data.profile);
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save details');
    } finally {
      setSavingStep3(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-gray-50 px-4 py-10 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-200/50 blur-3xl dark:bg-primary-500/10" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary-300/40 blur-3xl dark:bg-primary-500/10" />
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-white/10">
        <Link
          to="/"
          className="mb-6 flex items-center justify-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100"
        >
          <ShieldCheck className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          ServiceHub
        </Link>

        {step === 1 && (
          <>
            <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-100">Create Provider Account</h1>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Join ServiceHub and start your journey</p>
          </>
        )}

        <div className="mb-6">
          <Stepper steps={STEPS} currentStep={step} />
        </div>

        {step === 1 && <BasicInfoStep onNext={() => setStep(2)} />}
        {step === 2 && (
          <ServicesStep
            data={servicesData}
            onChange={setServicesData}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <LocationStep
            data={locationData}
            onChange={setLocationData}
            onNext={handleLocationNext}
            onBack={() => setStep(2)}
            loading={savingStep3}
          />
        )}
        {step === 4 && profile && (
          <DocumentsStep profile={profile} setProfile={setProfile} onBack={() => setStep(3)} navigate={navigate} />
        )}

        {step === 1 && (
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
              Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
