'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { useDialogStore } from '@/store/dialogStore'; 
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddUserDialog() {
  const { createUser } = useUserStore();
  const { isOpen, closeDialog } = useDialogStore();
  const [newUserName, setNewUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserName.trim()) {
      toast.error('กรุณากรอกชื่อผู้ใช้');
      return;
    }

    setIsLoading(true);

    try {
      const user = await createUser(newUserName.trim());
      setNewUserName('');
      closeDialog();
      toast.success(`สร้างผู้ใช้ ${user.name} เรียบร้อยแล้ว`);
    } catch {
      toast.error('ไม่สามารถสร้างผู้ใช้ได้');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[425px]">
        {/* Make sure this DialogTitle is present for accessibility */}
        <DialogHeader>
          <DialogTitle>สร้างผู้ใช้ใหม่</DialogTitle>
          <DialogDescription>
            กรอกชื่อสำหรับผู้ใช้ใหม่ แล้วกดสร้าง
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleCreateUser}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">ชื่อผู้ใช้</Label>
              <Input
                id="name"
                placeholder="กรอกชื่อผู้ใช้"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={isLoading}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังสร้าง...
                </>
              ) : (
                'สร้างผู้ใช้'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}