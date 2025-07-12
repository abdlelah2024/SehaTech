
"use client"

import { Stethoscope, Key, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mb-4 inline-block">
                <Stethoscope className="h-12 w-12 text-primary mx-auto" />
            </div>
          <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
          <CardDescription>
            أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى حسابك
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-right">البريد الإلكتروني</Label>
            <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="m@example.com" required className="pl-8 text-right" />
            </div>
          </div>
          <div className="grid gap-2">
             <div className="flex items-center">
                 <Label htmlFor="password" className="text-right">كلمة المرور</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  نسيت كلمة المرور؟
                </Link>
            </div>

            <div className="relative">
                <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" required className="pl-8 text-right" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/dashboard" className="w-full">
            <Button className="w-full">
                تسجيل الدخول
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
