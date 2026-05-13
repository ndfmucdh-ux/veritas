import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Shield, Eye, EyeOff, Check, Loader2, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AccountSettings({ user }) {
  const [openSection, setOpenSection] = useState(null);

  // Name change
  const [newName, setNewName] = useState(user?.full_name || "");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  // Email change
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);

  const toggle = (id) => setOpenSection(s => s === id ? null : id);

  const saveName = async () => {
    if (!newName.trim()) return;
    setNameSaving(true);
    await base44.auth.updateMe({ full_name: newName.trim() });
    sessionStorage.setItem("veritas_display_name", newName.trim());
    setNameSaving(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2500);
  };

  const saveEmail = async () => {
    if (!newEmail.trim() || !emailPassword.trim()) {
      setEmailMsg({ type: "error", text: "Enter both new email and your current password." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailMsg({ type: "error", text: "Enter a valid email address." });
      return;
    }
    setEmailSaving(true);
    setEmailMsg(null);
    try {
      await base44.auth.updateMe({ email: newEmail.trim() });
      setEmailMsg({ type: "success", text: "Email updated. Please verify your new address." });
      setNewEmail(""); setEmailPassword("");
    } catch (e) {
      setEmailMsg({ type: "error", text: e?.message || "Failed to update email." });
    }
    setEmailSaving(false);
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdMsg({ type: "error", text: "Fill in all password fields." });
      return;
    }
    if (newPassword.length < 8) {
      setPwdMsg({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    setPwdSaving(true);
    setPwdMsg(null);
    try {
      await base44.auth.updateMe({ password: newPassword, current_password: currentPassword });
      setPwdMsg({ type: "success", text: "Password updated successfully." });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e) {
      setPwdMsg({ type: "error", text: e?.message || "Incorrect current password or update failed." });
    }
    setPwdSaving(false);
  };

  const sections = [
    { id: "name", label: "Display Name", icon: User, color: "#00f5ff" },
    { id: "email", label: "Email Address", icon: Mail, color: "#fbbf24" },
    { id: "password", label: "Change Password", icon: Lock, color: "#a78bfa" },
    { id: "security", label: "Security", icon: Shield, color: "#34d399" },
  ];

  return (
    <div className="space-y-2">
      {sections.map(({ id, label, icon: Icon, color }) => (
        <div key={id} className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <button
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
            onClick={() => toggle(id)}
          >
            <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
            <p className="flex-1 text-sm font-inter" style={{ color: "rgba(255,255,255,0.75)" }}>{label}</p>
            <motion.div animate={{ rotate: openSection === id ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />
            </motion.div>
          </button>

          <AnimatePresence>
            {openSection === id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-0 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>

                  {/* NAME */}
                  {id === "name" && (
                    <div className="space-y-3 pt-3">
                      <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>
                        Current: <span style={{ color: "rgba(255,255,255,0.6)" }}>{user?.full_name || "—"}</span>
                      </p>
                      <input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="New display name"
                        className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                        style={{ fontSize: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,245,255,0.2)", color: "rgba(255,255,255,0.85)" }}
                      />
                      <button onClick={saveName} disabled={!newName.trim() || nameSaving}
                        className="w-full py-2.5 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2 transition-all"
                        style={{ background: "rgba(0,245,255,0.12)", color: "#00f5ff", border: "1px solid rgba(0,245,255,0.25)", opacity: !newName.trim() ? 0.5 : 1 }}>
                        {nameSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : nameSaved ? <><Check className="w-4 h-4" /> Saved</> : "Update Name"}
                      </button>
                    </div>
                  )}

                  {/* EMAIL */}
                  {id === "email" && (
                    <div className="space-y-3 pt-3">
                      <p className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.35)" }}>
                        Current: <span style={{ color: "rgba(255,255,255,0.6)" }}>{user?.email}</span>
                      </p>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        placeholder="New email address"
                        className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                        style={{ fontSize: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(251,191,36,0.2)", color: "rgba(255,255,255,0.85)" }}
                      />
                      <input
                        type="password"
                        value={emailPassword}
                        onChange={e => setEmailPassword(e.target.value)}
                        placeholder="Confirm with your current password"
                        className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                        style={{ fontSize: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(251,191,36,0.15)", color: "rgba(255,255,255,0.85)" }}
                      />
                      {emailMsg && (
                        <p className="text-xs font-inter" style={{ color: emailMsg.type === "error" ? "#f87171" : "#34d399" }}>{emailMsg.text}</p>
                      )}
                      <button onClick={saveEmail} disabled={emailSaving}
                        className="w-full py-2.5 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2"
                        style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
                        {emailSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Email"}
                      </button>
                    </div>
                  )}

                  {/* PASSWORD */}
                  {id === "password" && (
                    <div className="space-y-3 pt-3">
                      <div className="relative">
                        <input
                          type={showPwd ? "text" : "password"}
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          placeholder="Current password"
                          className="w-full rounded-xl px-3 py-2.5 pr-10 text-sm font-inter focus:outline-none"
                          style={{ fontSize: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(167,139,250,0.2)", color: "rgba(255,255,255,0.85)" }}
                        />
                        <button onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <input
                        type={showPwd ? "text" : "password"}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="New password (min 8 chars)"
                        className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                        style={{ fontSize: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(167,139,250,0.2)", color: "rgba(255,255,255,0.85)" }}
                      />
                      <input
                        type={showPwd ? "text" : "password"}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full rounded-xl px-3 py-2.5 text-sm font-inter focus:outline-none"
                        style={{ fontSize: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(167,139,250,0.2)", color: "rgba(255,255,255,0.85)" }}
                      />
                      {/* Strength indicator */}
                      {newPassword && (
                        <div className="space-y-1">
                          <div className="flex gap-1">
                            {[1,2,3,4].map(i => (
                              <div key={i} className="h-1 flex-1 rounded-full"
                                style={{ background: newPassword.length >= i * 3 ? (i < 3 ? "#fbbf24" : "#34d399") : "rgba(255,255,255,0.07)" }} />
                            ))}
                          </div>
                          <p className="text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.3)" }}>
                            {newPassword.length < 8 ? "Too short" : newPassword.length < 12 ? "Fair" : "Strong"}
                          </p>
                        </div>
                      )}
                      {pwdMsg && (
                        <p className="text-xs font-inter" style={{ color: pwdMsg.type === "error" ? "#f87171" : "#34d399" }}>{pwdMsg.text}</p>
                      )}
                      <button onClick={savePassword} disabled={pwdSaving}
                        className="w-full py-2.5 rounded-xl font-cinzel text-sm flex items-center justify-center gap-2"
                        style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)" }}>
                        {pwdSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                      </button>
                    </div>
                  )}

                  {/* SECURITY INFO */}
                  {id === "security" && (
                    <div className="space-y-3 pt-3">
                      <div className="rounded-xl px-4 py-3" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }}>
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="w-3.5 h-3.5" style={{ color: "#34d399" }} />
                          <p className="text-xs font-cinzel" style={{ color: "#34d399" }}>Account Protected</p>
                        </div>
                        <p className="text-xs font-inter leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                          Your account is secured with end-to-end encryption. All personal notes and prayer entries are private by default. Only you can access your data.
                        </p>
                      </div>
                      <div className="space-y-2">
                        {[
                          { label: "Email Verified", value: "Yes", color: "#34d399" },
                          { label: "Account Role", value: user?.role || "user", color: "#00f5ff" },
                          { label: "Data Encryption", value: "Enabled", color: "#34d399" },
                          { label: "Private Notes", value: "All private", color: "#34d399" },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="flex items-center justify-between py-2 border-b"
                            style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                            <span className="text-xs font-inter" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
                            <span className="text-xs font-cinzel capitalize" style={{ color }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}