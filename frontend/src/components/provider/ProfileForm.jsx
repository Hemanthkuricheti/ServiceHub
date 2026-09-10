import { useState } from 'react';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import CategoryPicker from './CategoryPicker';
import { suggestCategoriesApi } from '../../api/ai.api';
import { SERVICE_CATEGORIES } from '../../utils/constants';
import { SERVICE_ICONS } from '../../utils/serviceIcons';

const ProfileForm = ({ profile, onSave, saving, categoriesLocked, skillsLocked }) => {
  const [categories, setCategories] = useState(profile.categories || []);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(profile.skills || []);
  const [experienceYears, setExperienceYears] = useState(profile.experienceYears ?? '');
  const [location, setLocation] = useState({
    address: profile.location?.address || '',
    city: profile.location?.city || '',
    state: profile.location?.state || '',
    pincode: profile.location?.pincode || '',
  });
  const [workDescription, setWorkDescription] = useState('');
  const [suggestCategory, setSuggestCategory] = useState('');
  const [suggesting, setSuggesting] = useState(false);

  const handleAiSuggest = async () => {
    if (!workDescription.trim() && !suggestCategory) {
      toast.error('Describe your work or pick a category first');
      return;
    }
    setSuggesting(true);
    try {
      const { data } = await suggestCategoriesApi(workDescription.trim(), suggestCategory || undefined);
      const { categories: suggestedCategories, skills: suggestedSkills } = data.data;
      setCategories((prev) => [...new Set([...prev, ...suggestedCategories])]);
      setSkills((prev) => [...new Set([...prev, ...suggestedSkills])]);
      toast.success('Suggestions added below — review and adjust as needed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI suggestion failed');
    } finally {
      setSuggesting(false);
    }
  };

  const toggleCategory = (category) => {
    if (categoriesLocked) return;
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const addSkill = (e) => {
    if (e.key !== 'Enter' || !skillInput.trim()) return;
    e.preventDefault();
    if (!skills.includes(skillInput.trim())) {
      setSkills((prev) => [...prev, skillInput.trim()]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => setSkills((prev) => prev.filter((s) => s !== skill));

  const handleSubmit = (e) => {
    e.preventDefault();
    const pendingSkill = skillInput.trim();
    const finalSkills =
      pendingSkill && !skills.includes(pendingSkill) ? [...skills, pendingSkill] : skills;

    if (pendingSkill) {
      setSkills(finalSkills);
      setSkillInput('');
    }

    const payload = {};
    if (!categoriesLocked) {
      payload.categories = categories;
      payload.location = location;
    }
    if (!skillsLocked) {
      payload.skills = finalSkills;
      payload.experienceYears = Number(experienceYears) || 0;
    }
    onSave(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
    >
      {!categoriesLocked && (
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
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">Service Categories</h3>
        <CategoryPicker selected={categories} onToggle={toggleCategory} disabled={categoriesLocked} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">Skills</h3>
        {!skillsLocked && (
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={addSkill}
            placeholder="Type a skill, then press Enter (or just Save)"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            >
              {skill}
              {!skillsLocked && (
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  aria-label={`Remove ${skill}`}
                >
                  ✕
                </button>
              )}
            </span>
          ))}
          {!skills.length && <p className="text-sm text-gray-400 dark:text-gray-500">No skills added yet.</p>}
        </div>
      </div>

      <Input
        label="Years of Experience"
        type="number"
        min="0"
        disabled={skillsLocked}
        value={experienceYears}
        onChange={(e) => setExperienceYears(e.target.value)}
      />

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">Service Location</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Address"
            disabled={categoriesLocked}
            value={location.address}
            onChange={(e) => setLocation((prev) => ({ ...prev, address: e.target.value }))}
          />
          <Input
            label="City"
            disabled={categoriesLocked}
            value={location.city}
            onChange={(e) => setLocation((prev) => ({ ...prev, city: e.target.value }))}
          />
          <Input
            label="State"
            disabled={categoriesLocked}
            value={location.state}
            onChange={(e) => setLocation((prev) => ({ ...prev, state: e.target.value }))}
          />
          <Input
            label="Pincode"
            disabled={categoriesLocked}
            value={location.pincode}
            onChange={(e) => setLocation((prev) => ({ ...prev, pincode: e.target.value }))}
          />
        </div>
      </div>

      {!(categoriesLocked && skillsLocked) && (
        <Button type="submit" loading={saving} className="self-start">
          Save Profile
        </Button>
      )}
    </form>
  );
};

export default ProfileForm;
