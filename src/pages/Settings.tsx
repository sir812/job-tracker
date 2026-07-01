import React, { useState } from "react";
import { useToasts } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Toggle } from "../components/ui/Toggle";
import { Bell, Key, Settings as SettingsIcon, AlertOctagon } from "lucide-react";

export const Settings: React.FC = () => {
  const { success, info } = useToasts();
  const { theme, toggleTheme } = useTheme();

  // Settings states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [pushNotes, setPushNotes] = useState(true);

  const handleSavePreferences = () => {
    success("Application preferences saved!", "Done");
  };

  const handleResetData = () => {
    info("Mock database reset triggered", "Reset completed");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="select-none">
        <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">Settings</h2>
        <p className="text-xs text-black dark:text-white mt-1">Configure layout preferences, notifications, and reset parameters</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 select-none">
        {/* Settings Navigation / Info Card */}
        <Card className="lg:col-span-1 flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-neutral-800 pb-4">
            <SettingsIcon className="w-5 h-5 text-cyan-400 shrink-0" />
            <h3 className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">Categories</h3>
          </div>
          <div className="flex flex-col gap-1.5 font-semibold text-sm">
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-black border border-slate-200 dark:border-neutral-800 text-cyan-500 dark:text-cyan-400 text-left cursor-pointer">
              <Bell className="w-4 h-4 shrink-0" />
              <span>Notifications & Theme</span>
            </button>
            <button
              onClick={() => info("Security credentials modal loaded", "Mock Form")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900/80 text-left cursor-pointer"
            >
              <Key className="w-4 h-4 shrink-0" />
              <span>Security & Password</span>
            </button>
          </div>
        </Card>

        {/* Configurations Card */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="flex flex-col gap-6">
            <h4 className="text-md font-bold text-black dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan-400" />
              <span>Preferences</span>
            </h4>

            <div className="divide-y divide-slate-200 dark:divide-neutral-800 space-y-1">
              <Toggle
                label="Email Alerts"
                description="Receive instant alerts when application statuses change"
                checked={emailAlerts}
                onChange={setEmailAlerts}
              />
              <Toggle
                label="Weekly Summary"
                description="Get a clean weekly report of your application progress numbers"
                checked={weeklyReport}
                onChange={setWeeklyReport}
              />
              <Toggle
                label="Push Notifications"
                description="Enable browser toast popups for upcoming interview reminders"
                checked={pushNotes}
                onChange={setPushNotes}
              />
              <Toggle
                label="Dark Mode"
                description="Switch layout design to dark slate background"
                checked={theme === "dark"}
                onChange={toggleTheme}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-neutral-800">
              <Button onClick={handleSavePreferences}>Save Preferences</Button>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="border-rose-200 dark:border-rose-950/40 bg-rose-50/40 dark:bg-black/70 flex flex-col gap-6">
            <div className="flex items-center gap-2.5 border-b border-rose-200 dark:border-rose-950/20 pb-4">
              <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />
              <h4 className="text-md font-bold text-rose-400">Danger Zone</h4>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h5 className="text-sm font-semibold text-black dark:text-white">Reset Local Database</h5>
                <p className="text-xs text-black dark:text-white mt-1 max-w-md">
                  This will purge all custom job entries and restore the default mock listings. This action is irreversible.
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={handleResetData}>
                Reset Data
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Settings;
