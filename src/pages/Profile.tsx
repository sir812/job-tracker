import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToasts } from "../context/ToastContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { User, Sparkles, BookOpen } from "lucide-react";

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToasts();
  const [editing, setEditing] = useState(false);
  
  // Profile local states
  const [name, setName] = useState(user?.name ?? "User");
  const [bio, setBio] = useState("Aspiring Software Engineer focused on building responsive, pixel-perfect frontend products. Keen on React, TypeScript, and modern SaaS ecosystems.");
  const [skills, setSkills] = useState("React, Next.js, Tailwind CSS, TypeScript, GraphQL, Node.js");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(false);
    success("Profile details updated successfully!", "Done");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">My Profile</h2>
        <p className="text-xs text-black dark:text-white mt-1">Manage public profile details and professional summary info</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start select-none">
        {/* Left Column: Avatar & Summary card */}
        <Card className="lg:col-span-1 flex flex-col items-center text-center p-8 gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-2xl rounded-full" />
          
          {/* Avatar frame */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-black border-2 border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 text-3xl uppercase shadow-lg shadow-slate-900/10 dark:shadow-black/30">
              {name.substring(0, 2)}
            </div>
            <div className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-full shadow-md text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <h3 className="text-lg font-bold text-black dark:text-white">{name}</h3>
            <p className="text-xs text-black dark:text-white">{user?.email}</p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Active Job Hunter
          </span>

          <div className="w-full border-t border-slate-200 dark:border-neutral-800 pt-5 mt-2 flex flex-col gap-4 text-left">
            <div className="flex gap-3">
              <BookOpen className="w-4.5 h-4.5 text-black shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-black dark:text-white uppercase tracking-wide">Focus Area</h5>
                <p className="text-xs text-black dark:text-white mt-1">Frontend Engineering & UI/UX Design</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column: Editable Profile info form */}
        <Card className="lg:col-span-2">
          {!editing ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-bold text-black dark:text-white">Bio & Summary</h4>
                <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">Full Name</h5>
                  <p className="text-sm font-semibold text-black dark:text-white mt-1.5">{name}</p>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">Email Address</h5>
                  <p className="text-sm font-semibold text-black dark:text-white mt-1.5">{user?.email}</p>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">Professional Bio</h5>
                  <p className="text-sm text-black dark:text-white leading-relaxed mt-2 p-4 bg-slate-50 dark:bg-black/70 border border-slate-200 dark:border-neutral-800 rounded-xl">
                    {bio}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">Skills & Frameworks</h5>
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {skills.split(",").map((sk) => (
                      <span
                        key={sk}
                        className="text-xs font-medium bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 text-black dark:text-white px-3 py-1 rounded-full"
                      >
                        {sk.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <h4 className="text-md font-bold text-black dark:text-white">Edit Profile Info</h4>

              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />

              <Textarea
                label="Professional Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                charLimit={300}
                required
              />

              <Input
                label="Skills (comma separated)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                required
              />

              <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-neutral-800 pt-4 mt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
export default Profile;
