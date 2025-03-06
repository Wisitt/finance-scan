'use client';

import { useUserStore } from '@/store/userStore';


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function UserSelector() {
  const { users, currentUser, fetchUsers, setCurrentUser } = useUserStore();
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  
  const handleSelectUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);

      toast.success(`เลือกใช้งานในชื่อ ${user.name}`);

    }
  };
  
  // ฟังก์ชันสร้างตัวอักษรย่อจากชื่อ
  // const getInitials = (name: string) => {
  //   return name
  //     .split(' ')
  //     .map(part => part[0])
  //     .join('')
  //     .toUpperCase()
  //     .substring(0, 2);
  // };
  
  return (
    <div>
      <div className="flex items-center space-x-4">
        {currentUser ? (
          <div className="flex items-center space-x-2">
          {/* <Avatar className="h-7 w-7 border border-primary bg-primary/10">
            <AvatarFallback className="text-primary font-semibold">
              {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar> */}
            {/* <div>
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-xs text-gray-500">กำลังใช้งาน</p>
            </div> */}
          </div>
        ) : (
          <p className="text-gray-500">กรุณาเลือกผู้ใช้</p>
        )}
        
        <Select
          value={currentUser?.id}
          onValueChange={handleSelectUser}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="เลือกผู้ใช้" />
          </SelectTrigger>
          <SelectContent>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <UserPlus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreateUser}>
              <DialogHeader>
                <DialogTitle>สร้างผู้ใช้ใหม่</DialogTitle>
                <DialogDescription>
                  กรอกชื่อสำหรับผู้ใช้ใหม่ แล้วกดสร้าง
                </DialogDescription>
              </DialogHeader>
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
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isLoading}>
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
        </Dialog> */}
      </div>
    </div>
  );
}