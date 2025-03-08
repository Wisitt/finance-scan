// 'use client';

// import { useState } from 'react';
// import { useDialogStore } from '@/store/dialogStore';
// import { useUserStore } from '@/store/userStore';
// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { toast } from 'react-hot-toast';

// export default function AddUserDialog() {
//   const { isDialogOpen, closeDialog } = useDialogStore();
//   const { addUser } = useUserStore();
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!name.trim() || !email.trim()) {
//       toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
//       return;
//     }
    
//     setIsSubmitting(true);
//     try {
//       // สร้างไอดีแบบสุ่ม
//       const id = Math.random().toString(36).substring(2, 11);
      
//       // เพิ่มผู้ใช้ใหม่
//       addUser({
//         id,
//         name: name.trim(),
//         email: email.trim(),
//         avatar: null,
//       });
      
//       toast.success('เพิ่มบัญชีผู้ใช้เรียบร้อยแล้ว');
      
//       // รีเซ็ตฟอร์ม
//       setName('');
//       setEmail('');
//       closeDialog();
//     } catch (error) {
//       console.error('Error adding user:', error);
//       toast.error('เกิดข้อผิดพลาด โปรดลองอีกครั้ง');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
//       <DialogContent className="sm:max-w-[425px]">
//         <form onSubmit={handleSubmit}>
//           <DialogHeader>
//             <DialogTitle>เพิ่มบัญชีผู้ใช้</DialogTitle>
//             <DialogDescription>
//               กรอกข้อมูลด้านล่างเพื่อเพิ่มบัญชีผู้ใช้ใหม่
//             </DialogDescription>
//           </DialogHeader>
//           <div className="grid gap-4 py-4">
//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label htmlFor="name" className="text-right">
//                 ชื่อ
//               </Label>
//               <Input
//                 id="name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className="col-span-3"
//                 required
//               />
//             </div>
//             <div className="grid grid-cols-4 items-center gap-4">
//               <Label htmlFor="email" className="text-right">
//                 อีเมล
//               </Label>
//               <Input
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="col-span-3"
//                 required
//               />
//             </div>
//           </div>
//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={closeDialog}>
//               ยกเลิก
//             </Button>
//             <Button type="submit" disabled={isSubmitting}>
//               {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }