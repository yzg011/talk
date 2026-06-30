import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function LoginDialog() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const isLogin = useAuthStore((s) => s.isLogin);

  const handleSubmit = () => {
    setErrMsg('');
    const success = login(username, password);
    if (!success) setErrMsg('账号或密码错误');
  };

  if (isLogin) {
    return (
      <Button variant="outline" size="sm" onClick={logout}>
        退出管理
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">管理员登录</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>管理员登录</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>账号</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="输入管理员账号" />
          </div>
          <div className="space-y-2">
            <Label>密码</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="输入密码" />
          </div>
          {errMsg && <p className="text-sm text-destructive">{errMsg}</p>}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <Button onClick={handleSubmit}>登录</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}