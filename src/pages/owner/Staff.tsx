import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { Loader2, Plus, Power, Shield, User as UserIcon } from "lucide-react";

const Staff = () => {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  const { data: staffList = [], isLoading: isLoadingStaff } = useQuery({
    queryKey: ['staff'],
    queryFn: () => api.owner.getStaff()
  });

  const addStaffMutation = useMutation({
    mutationFn: (data: any) => api.owner.addStaff(data),
    onSuccess: () => {
      toast.success("Staff member added");
      setEmail("");
      setFullName("");
      setPassword("");
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add staff");
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string, is_active: boolean }) => api.owner.toggleStaffStatus(id, is_active),
    onSuccess: (data) => {
      toast.success(`Staff member ${data.is_active ? 'activated' : 'deactivated'}`);
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to toggle status");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName || !password) return toast.error("Fill all fields");
    addStaffMutation.mutate({
      email,
      full_name: fullName,
      password,
      branch_id: user?.branch_id || '11111111-1111-1111-1111-111111111111'
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <h1 className="font-display text-3xl sm:text-5xl tracking-wide">STAFF MANAGEMENT</h1>
        <p className="text-[10px] sm:text-xs tracking-widest text-muted-foreground">SUMMIT BRANCH</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1 border border-border bg-card p-4 sm:p-6 space-y-5">
          <h2 className="font-display text-2xl">ADD STAFF</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] tracking-widest text-muted-foreground">FULL NAME</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} className="acid-glow w-full border-0 border-b border-border bg-transparent py-2 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-[10px] tracking-widest text-muted-foreground">EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="acid-glow w-full border-0 border-b border-border bg-transparent py-2 outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-[10px] tracking-widest text-muted-foreground">PASSWORD</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="acid-glow w-full border-0 border-b border-border bg-transparent py-2 outline-none focus:border-primary" />
            </div>
            <button
              type="submit"
              disabled={addStaffMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-primary py-3 font-display text-lg tracking-widest text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {addStaffMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Plus className="h-4 w-4" /> ADD STAFF</>}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 border border-border bg-card p-4 sm:p-6">
          <h2 className="font-display text-2xl mb-4">STAFF LIST</h2>
          
          {isLoadingStaff ? (
            <div className="py-12 flex justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : staffList.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border text-sm text-muted-foreground">
              No staff members found
            </div>
          ) : (
            <div className="space-y-3">
              {staffList.map((staff: any) => (
                <div key={staff.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border bg-background/50 hover:bg-background transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-muted flex items-center justify-center rounded-full">
                      {staff.role === 'admin' ? <Shield className="h-5 w-5 text-primary" /> : <UserIcon className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="font-display text-lg flex items-center gap-2">
                        {staff.full_name}
                        {!staff.is_active && <span className="text-[10px] tracking-widest text-destructive bg-destructive/10 px-2 py-0.5 rounded">INACTIVE</span>}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        {staff.email} <span className="opacity-50">•</span> {staff.role.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatusMutation.mutate({ id: staff.id, is_active: !staff.is_active })}
                      disabled={toggleStatusMutation.isPending}
                      className={`flex items-center gap-2 px-4 py-2 text-xs font-display tracking-widest transition-colors ${
                        staff.is_active 
                          ? 'bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground' 
                          : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
                      }`}
                    >
                      <Power className="h-3 w-3" />
                      {staff.is_active ? 'DEACTIVATE' : 'ACTIVATE'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Staff;
