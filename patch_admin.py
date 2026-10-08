import re

with open('src/components/portals/AdminControlPortal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Destructure userProfiles and registerUserProfile
if 'userProfiles,' not in content:
    content = content.replace('kycApplications,', 'kycApplications,\n    userProfiles,\n    registerUserProfile,')

# Add user_registrations to tab state
content = content.replace(
    "useState<'patient_queue' | 'doctor_queue' | 'nurse_queue' | 'emergency_direct' | 'network_audit'>('patient_queue')",
    "useState<'patient_queue' | 'user_registrations' | 'doctor_queue' | 'nurse_queue' | 'emergency_direct' | 'network_audit'>('patient_queue')"
)

# Render User Registrations Tab Button
tab_button = '''
        <button
          onClick={() => setActiveAdminTab('user_registrations')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeAdminTab === 'user_registrations'
              ? 'bg-purple-50 text-purple-700 shadow-sm border border-purple-200'
              : 'text-slate-600 hover:bg-slate-50 border border-transparent'
          }`}
        >
          <UserPlus className="w-4 h-4" /> Account Signups
          {userProfiles?.filter((p: any) => p.accountStatus === 'PENDING').length > 0 && (
            <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded-full mono">
              {userProfiles.filter((p: any) => p.accountStatus === 'PENDING').length}
            </span>
          )}
        </button>
'''
content = content.replace(
    "onClick={() => setActiveAdminTab('doctor_queue')}",
    "onClick={() => setActiveAdminTab('doctor_queue')}\n        " + tab_button + "\n        <button onClick={() => setActiveAdminTab('doctor_queue')}"
)
content = content.replace('<button onClick={() => setActiveAdminTab(\'doctor_queue\')}\n        <button', '<button')

# Add Tab Content for user_registrations
user_reg_content = '''
      {activeAdminTab === 'user_registrations' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Pending Account Registrations</h3>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userProfiles?.filter((p: any) => p.accountStatus === 'PENDING').length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No pending account registrations.
                      </td>
                    </tr>
                  )}
                  {userProfiles?.filter((p: any) => p.accountStatus === 'PENDING').map((profile: any) => (
                    <tr key={profile.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{profile.fullName}</div>
                        <div className="text-xs text-slate-500 mono">{profile.email}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{profile.role}</td>
                      <td className="px-6 py-4">
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-200">
                          PENDING
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => registerUserProfile({ ...profile, accountStatus: 'APPROVED' })}
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => registerUserProfile({ ...profile, accountStatus: 'REJECTED' })}
                          className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
'''

content = content.replace(
    "{activeAdminTab === 'doctor_queue' && (",
    user_reg_content + "\n      {activeAdminTab === 'doctor_queue' && ("
)

with open('src/components/portals/AdminControlPortal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
