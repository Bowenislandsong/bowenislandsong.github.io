# objdump -d bomb > bomb.asm
bomb:     file format elf64-x86-64


Disassembly of section .init:

0000000000001000 <_init>:
    1000:	48 83 ec 08          	sub    $0x8,%rsp
    1004:	48 8b 05 cd 3f 00 00 	mov    0x3fcd(%rip),%rax        # 4fd8 <__gmon_start__@Base>
    100b:	48 85 c0             	test   %rax,%rax
    100e:	74 02                	je     1012 <_init+0x12>
    1010:	ff d0                	call   *%rax
    1012:	48 83 c4 08          	add    $0x8,%rsp
    1016:	c3                   	ret

Disassembly of section .plt:

0000000000001020 <printf@plt-0x10>:
    1020:	ff 35 ca 3f 00 00    	push   0x3fca(%rip)        # 4ff0 <_GLOBAL_OFFSET_TABLE_+0x8>
    1026:	ff 25 cc 3f 00 00    	jmp    *0x3fcc(%rip)        # 4ff8 <_GLOBAL_OFFSET_TABLE_+0x10>
    102c:	0f 1f 40 00          	nopl   0x0(%rax)

0000000000001030 <printf@plt>:
    1030:	ff 25 ca 3f 00 00    	jmp    *0x3fca(%rip)        # 5000 <printf@GLIBC_2.2.5>
    1036:	68 00 00 00 00       	push   $0x0
    103b:	e9 e0 ff ff ff       	jmp    1020 <_init+0x20>

0000000000001040 <sprintf@plt>:
    1040:	ff 25 c2 3f 00 00    	jmp    *0x3fc2(%rip)        # 5008 <sprintf@GLIBC_2.2.5>
    1046:	68 01 00 00 00       	push   $0x1
    104b:	e9 d0 ff ff ff       	jmp    1020 <_init+0x20>

0000000000001050 <curl_free@plt>:
    1050:	ff 25 ba 3f 00 00    	jmp    *0x3fba(%rip)        # 5010 <curl_free@CURL_OPENSSL_4>
    1056:	68 02 00 00 00       	push   $0x2
    105b:	e9 c0 ff ff ff       	jmp    1020 <_init+0x20>

0000000000001060 <curl_global_init@plt>:
    1060:	ff 25 b2 3f 00 00    	jmp    *0x3fb2(%rip)        # 5018 <curl_global_init@CURL_OPENSSL_4>
    1066:	68 03 00 00 00       	push   $0x3
    106b:	e9 b0 ff ff ff       	jmp    1020 <_init+0x20>

0000000000001070 <curl_global_cleanup@plt>:
    1070:	ff 25 aa 3f 00 00    	jmp    *0x3faa(%rip)        # 5020 <curl_global_cleanup@CURL_OPENSSL_4>
    1076:	68 04 00 00 00       	push   $0x4
    107b:	e9 a0 ff ff ff       	jmp    1020 <_init+0x20>

0000000000001080 <curl_easy_getinfo@plt>:
    1080:	ff 25 a2 3f 00 00    	jmp    *0x3fa2(%rip)        # 5028 <curl_easy_getinfo@CURL_OPENSSL_4>
    1086:	68 05 00 00 00       	push   $0x5
    108b:	e9 90 ff ff ff       	jmp    1020 <_init+0x20>

0000000000001090 <calloc@plt>:
    1090:	ff 25 9a 3f 00 00    	jmp    *0x3f9a(%rip)        # 5030 <calloc@GLIBC_2.2.5>
    1096:	68 06 00 00 00       	push   $0x6
    109b:	e9 80 ff ff ff       	jmp    1020 <_init+0x20>

00000000000010a0 <memcpy@plt>:
    10a0:	ff 25 92 3f 00 00    	jmp    *0x3f92(%rip)        # 5038 <memcpy@GLIBC_2.14>
    10a6:	68 07 00 00 00       	push   $0x7
    10ab:	e9 70 ff ff ff       	jmp    1020 <_init+0x20>

00000000000010b0 <__isoc99_sscanf@plt>:
    10b0:	ff 25 8a 3f 00 00    	jmp    *0x3f8a(%rip)        # 5040 <__isoc99_sscanf@GLIBC_2.7>
    10b6:	68 08 00 00 00       	push   $0x8
    10bb:	e9 60 ff ff ff       	jmp    1020 <_init+0x20>

00000000000010c0 <fclose@plt>:
    10c0:	ff 25 82 3f 00 00    	jmp    *0x3f82(%rip)        # 5048 <fclose@GLIBC_2.2.5>
    10c6:	68 09 00 00 00       	push   $0x9
    10cb:	e9 50 ff ff ff       	jmp    1020 <_init+0x20>

00000000000010d0 <__ctype_b_loc@plt>:
    10d0:	ff 25 7a 3f 00 00    	jmp    *0x3f7a(%rip)        # 5050 <__ctype_b_loc@GLIBC_2.3>
    10d6:	68 0a 00 00 00       	push   $0xa
    10db:	e9 40 ff ff ff       	jmp    1020 <_init+0x20>

00000000000010e0 <fputs@plt>:
    10e0:	ff 25 72 3f 00 00    	jmp    *0x3f72(%rip)        # 5058 <fputs@GLIBC_2.2.5>
    10e6:	68 0b 00 00 00       	push   $0xb
    10eb:	e9 30 ff ff ff       	jmp    1020 <_init+0x20>

00000000000010f0 <curl_easy_setopt@plt>:
    10f0:	ff 25 6a 3f 00 00    	jmp    *0x3f6a(%rip)        # 5060 <curl_easy_setopt@CURL_OPENSSL_4>
    10f6:	68 0c 00 00 00       	push   $0xc
    10fb:	e9 20 ff ff ff       	jmp    1020 <_init+0x20>

0000000000001100 <fopen@plt>:
    1100:	ff 25 62 3f 00 00    	jmp    *0x3f62(%rip)        # 5068 <fopen@GLIBC_2.2.5>
    1106:	68 0d 00 00 00       	push   $0xd
    110b:	e9 10 ff ff ff       	jmp    1020 <_init+0x20>

0000000000001110 <free@plt>:
    1110:	ff 25 5a 3f 00 00    	jmp    *0x3f5a(%rip)        # 5070 <free@GLIBC_2.2.5>
    1116:	68 0e 00 00 00       	push   $0xe
    111b:	e9 00 ff ff ff       	jmp    1020 <_init+0x20>

0000000000001120 <exit@plt>:
    1120:	ff 25 52 3f 00 00    	jmp    *0x3f52(%rip)        # 5078 <exit@GLIBC_2.2.5>
    1126:	68 0f 00 00 00       	push   $0xf
    112b:	e9 f0 fe ff ff       	jmp    1020 <_init+0x20>

0000000000001130 <getenv@plt>:
    1130:	ff 25 4a 3f 00 00    	jmp    *0x3f4a(%rip)        # 5080 <getenv@GLIBC_2.2.5>
    1136:	68 10 00 00 00       	push   $0x10
    113b:	e9 e0 fe ff ff       	jmp    1020 <_init+0x20>

0000000000001140 <curl_easy_cleanup@plt>:
    1140:	ff 25 42 3f 00 00    	jmp    *0x3f42(%rip)        # 5088 <curl_easy_cleanup@CURL_OPENSSL_4>
    1146:	68 11 00 00 00       	push   $0x11
    114b:	e9 d0 fe ff ff       	jmp    1020 <_init+0x20>

0000000000001150 <fputc@plt>:
    1150:	ff 25 3a 3f 00 00    	jmp    *0x3f3a(%rip)        # 5090 <fputc@GLIBC_2.2.5>
    1156:	68 12 00 00 00       	push   $0x12
    115b:	e9 c0 fe ff ff       	jmp    1020 <_init+0x20>

0000000000001160 <curl_easy_init@plt>:
    1160:	ff 25 32 3f 00 00    	jmp    *0x3f32(%rip)        # 5098 <curl_easy_init@CURL_OPENSSL_4>
    1166:	68 13 00 00 00       	push   $0x13
    116b:	e9 b0 fe ff ff       	jmp    1020 <_init+0x20>

0000000000001170 <curl_easy_perform@plt>:
    1170:	ff 25 2a 3f 00 00    	jmp    *0x3f2a(%rip)        # 50a0 <curl_easy_perform@CURL_OPENSSL_4>
    1176:	68 14 00 00 00       	push   $0x14
    117b:	e9 a0 fe ff ff       	jmp    1020 <_init+0x20>

0000000000001180 <strcmp@plt>:
    1180:	ff 25 22 3f 00 00    	jmp    *0x3f22(%rip)        # 50a8 <strcmp@GLIBC_2.2.5>
    1186:	68 15 00 00 00       	push   $0x15
    118b:	e9 90 fe ff ff       	jmp    1020 <_init+0x20>

0000000000001190 <strtol@plt>:
    1190:	ff 25 1a 3f 00 00    	jmp    *0x3f1a(%rip)        # 50b0 <strtol@GLIBC_2.2.5>
    1196:	68 16 00 00 00       	push   $0x16
    119b:	e9 80 fe ff ff       	jmp    1020 <_init+0x20>

00000000000011a0 <curl_easy_strerror@plt>:
    11a0:	ff 25 12 3f 00 00    	jmp    *0x3f12(%rip)        # 50b8 <curl_easy_strerror@CURL_OPENSSL_4>
    11a6:	68 17 00 00 00       	push   $0x17
    11ab:	e9 70 fe ff ff       	jmp    1020 <_init+0x20>

00000000000011b0 <puts@plt>:
    11b0:	ff 25 0a 3f 00 00    	jmp    *0x3f0a(%rip)        # 50c0 <puts@GLIBC_2.2.5>
    11b6:	68 18 00 00 00       	push   $0x18
    11bb:	e9 60 fe ff ff       	jmp    1020 <_init+0x20>

00000000000011c0 <fgets@plt>:
    11c0:	ff 25 02 3f 00 00    	jmp    *0x3f02(%rip)        # 50c8 <fgets@GLIBC_2.2.5>
    11c6:	68 19 00 00 00       	push   $0x19
    11cb:	e9 50 fe ff ff       	jmp    1020 <_init+0x20>

00000000000011d0 <snprintf@plt>:
    11d0:	ff 25 fa 3e 00 00    	jmp    *0x3efa(%rip)        # 50d0 <snprintf@GLIBC_2.2.5>
    11d6:	68 1a 00 00 00       	push   $0x1a
    11db:	e9 40 fe ff ff       	jmp    1020 <_init+0x20>

00000000000011e0 <memmove@plt>:
    11e0:	ff 25 f2 3e 00 00    	jmp    *0x3ef2(%rip)        # 50d8 <memmove@GLIBC_2.2.5>
    11e6:	68 1b 00 00 00       	push   $0x1b
    11eb:	e9 30 fe ff ff       	jmp    1020 <_init+0x20>

00000000000011f0 <realloc@plt>:
    11f0:	ff 25 ea 3e 00 00    	jmp    *0x3eea(%rip)        # 50e0 <realloc@GLIBC_2.2.5>
    11f6:	68 1c 00 00 00       	push   $0x1c
    11fb:	e9 20 fe ff ff       	jmp    1020 <_init+0x20>

0000000000001200 <access@plt>:
    1200:	ff 25 e2 3e 00 00    	jmp    *0x3ee2(%rip)        # 50e8 <access@GLIBC_2.2.5>
    1206:	68 1d 00 00 00       	push   $0x1d
    120b:	e9 10 fe ff ff       	jmp    1020 <_init+0x20>

0000000000001210 <curl_easy_escape@plt>:
    1210:	ff 25 da 3e 00 00    	jmp    *0x3eda(%rip)        # 50f0 <curl_easy_escape@CURL_OPENSSL_4>
    1216:	68 1e 00 00 00       	push   $0x1e
    121b:	e9 00 fe ff ff       	jmp    1020 <_init+0x20>

0000000000001220 <strdup@plt>:
    1220:	ff 25 d2 3e 00 00    	jmp    *0x3ed2(%rip)        # 50f8 <strdup@GLIBC_2.2.5>
    1226:	68 1f 00 00 00       	push   $0x1f
    122b:	e9 f0 fd ff ff       	jmp    1020 <_init+0x20>

Disassembly of section .plt.got:

0000000000001230 <__cxa_finalize@plt>:
    1230:	ff 25 8a 3d 00 00    	jmp    *0x3d8a(%rip)        # 4fc0 <__cxa_finalize@GLIBC_2.2.5>
    1236:	66 90                	xchg   %ax,%ax

Disassembly of section .text:

0000000000001240 <_start>:
    1240:	31 ed                	xor    %ebp,%ebp
    1242:	49 89 d1             	mov    %rdx,%r9
    1245:	5e                   	pop    %rsi
    1246:	48 89 e2             	mov    %rsp,%rdx
    1249:	48 83 e4 f0          	and    $0xfffffffffffffff0,%rsp
    124d:	50                   	push   %rax
    124e:	54                   	push   %rsp
    124f:	45 31 c0             	xor    %r8d,%r8d
    1252:	31 c9                	xor    %ecx,%ecx
    1254:	48 8d 3d 87 01 00 00 	lea    0x187(%rip),%rdi        # 13e2 <main>
    125b:	ff 15 67 3d 00 00    	call   *0x3d67(%rip)        # 4fc8 <__libc_start_main@GLIBC_2.34>
    1261:	f4                   	hlt
    1262:	66 2e 0f 1f 84 00 00 	cs nopw 0x0(%rax,%rax,1)
    1269:	00 00 00 
    126c:	0f 1f 40 00          	nopl   0x0(%rax)

0000000000001270 <deregister_tm_clones>:
    1270:	48 8d 3d 21 3f 00 00 	lea    0x3f21(%rip),%rdi        # 5198 <__TMC_END__>
    1277:	48 8d 05 1a 3f 00 00 	lea    0x3f1a(%rip),%rax        # 5198 <__TMC_END__>
    127e:	48 39 f8             	cmp    %rdi,%rax
    1281:	74 15                	je     1298 <deregister_tm_clones+0x28>
    1283:	48 8b 05 46 3d 00 00 	mov    0x3d46(%rip),%rax        # 4fd0 <_ITM_deregisterTMCloneTable@Base>
    128a:	48 85 c0             	test   %rax,%rax
    128d:	74 09                	je     1298 <deregister_tm_clones+0x28>
    128f:	ff e0                	jmp    *%rax
    1291:	0f 1f 80 00 00 00 00 	nopl   0x0(%rax)
    1298:	c3                   	ret
    1299:	0f 1f 80 00 00 00 00 	nopl   0x0(%rax)

00000000000012a0 <register_tm_clones>:
    12a0:	48 8d 3d f1 3e 00 00 	lea    0x3ef1(%rip),%rdi        # 5198 <__TMC_END__>
    12a7:	48 8d 35 ea 3e 00 00 	lea    0x3eea(%rip),%rsi        # 5198 <__TMC_END__>
    12ae:	48 29 fe             	sub    %rdi,%rsi
    12b1:	48 89 f0             	mov    %rsi,%rax
    12b4:	48 c1 ee 3f          	shr    $0x3f,%rsi
    12b8:	48 c1 f8 03          	sar    $0x3,%rax
    12bc:	48 01 c6             	add    %rax,%rsi
    12bf:	48 d1 fe             	sar    $1,%rsi
    12c2:	74 14                	je     12d8 <register_tm_clones+0x38>
    12c4:	48 8b 05 15 3d 00 00 	mov    0x3d15(%rip),%rax        # 4fe0 <_ITM_registerTMCloneTable@Base>
    12cb:	48 85 c0             	test   %rax,%rax
    12ce:	74 08                	je     12d8 <register_tm_clones+0x38>
    12d0:	ff e0                	jmp    *%rax
    12d2:	66 0f 1f 44 00 00    	nopw   0x0(%rax,%rax,1)
    12d8:	c3                   	ret
    12d9:	0f 1f 80 00 00 00 00 	nopl   0x0(%rax)

00000000000012e0 <__do_global_dtors_aux>:
    12e0:	f3 0f 1e fa          	endbr64
    12e4:	80 3d bd 3e 00 00 00 	cmpb   $0x0,0x3ebd(%rip)        # 51a8 <completed.0>
    12eb:	75 2b                	jne    1318 <__do_global_dtors_aux+0x38>
    12ed:	55                   	push   %rbp
    12ee:	48 83 3d ca 3c 00 00 	cmpq   $0x0,0x3cca(%rip)        # 4fc0 <__cxa_finalize@GLIBC_2.2.5>
    12f5:	00 
    12f6:	48 89 e5             	mov    %rsp,%rbp
    12f9:	74 0c                	je     1307 <__do_global_dtors_aux+0x27>
    12fb:	48 8b 3d 06 3e 00 00 	mov    0x3e06(%rip),%rdi        # 5108 <__dso_handle>
    1302:	e8 29 ff ff ff       	call   1230 <__cxa_finalize@plt>
    1307:	e8 64 ff ff ff       	call   1270 <deregister_tm_clones>
    130c:	c6 05 95 3e 00 00 01 	movb   $0x1,0x3e95(%rip)        # 51a8 <completed.0>
    1313:	5d                   	pop    %rbp
    1314:	c3                   	ret
    1315:	0f 1f 00             	nopl   (%rax)
    1318:	c3                   	ret
    1319:	0f 1f 80 00 00 00 00 	nopl   0x0(%rax)

0000000000001320 <frame_dummy>:
    1320:	f3 0f 1e fa          	endbr64
    1324:	e9 77 ff ff ff       	jmp    12a0 <register_tm_clones>
    1329:	66 2e 0f 1f 84 00 00 	cs nopw 0x0(%rax,%rax,1)
    1330:	00 00 00 
    1333:	66 2e 0f 1f 84 00 00 	cs nopw 0x0(%rax,%rax,1)
    133a:	00 00 00 
    133d:	0f 1f 00             	nopl   (%rax)

0000000000001340 <explode_bomb>:
    1340:	48 83 ec 08          	sub    $0x8,%rsp
    1344:	48 89 f2             	mov    %rsi,%rdx
    1347:	89 fe                	mov    %edi,%esi
    1349:	bf 00 00 00 00       	mov    $0x0,%edi
    134e:	e8 0c 0c 00 00       	call   1f5f <driver_post>
    1353:	48 83 c4 08          	add    $0x8,%rsp
    1357:	c3                   	ret

0000000000001358 <strip>:
    1358:	41 54                	push   %r12
    135a:	55                   	push   %rbp
    135b:	53                   	push   %rbx
    135c:	49 89 fc             	mov    %rdi,%r12
    135f:	48 89 fd             	mov    %rdi,%rbp
    1362:	eb 04                	jmp    1368 <strip+0x10>
    1364:	48 83 c5 01          	add    $0x1,%rbp
    1368:	e8 63 fd ff ff       	call   10d0 <__ctype_b_loc@plt>
    136d:	48 8b 10             	mov    (%rax),%rdx
    1370:	0f b6 45 00          	movzbl 0x0(%rbp),%eax
    1374:	0f b6 c8             	movzbl %al,%ecx
    1377:	f6 44 4a 01 20       	testb  $0x20,0x1(%rdx,%rcx,2)
    137c:	75 e6                	jne    1364 <strip+0xc>
    137e:	84 c0                	test   %al,%al
    1380:	75 5b                	jne    13dd <strip+0x85>
    1382:	bb 00 00 00 00       	mov    $0x0,%ebx
    1387:	4c 39 e5             	cmp    %r12,%rbp
    138a:	74 0f                	je     139b <strip+0x43>
    138c:	48 8d 53 01          	lea    0x1(%rbx),%rdx
    1390:	48 89 ee             	mov    %rbp,%rsi
    1393:	4c 89 e7             	mov    %r12,%rdi
    1396:	e8 45 fe ff ff       	call   11e0 <memmove@plt>
    139b:	48 89 d8             	mov    %rbx,%rax
    139e:	5b                   	pop    %rbx
    139f:	5d                   	pop    %rbp
    13a0:	41 5c                	pop    %r12
    13a2:	c3                   	ret
    13a3:	66 66 2e 0f 1f 84 00 	data16 cs nopw 0x0(%rax,%rax,1)
    13aa:	00 00 00 00 
    13ae:	66 90                	xchg   %ax,%ax
    13b0:	48 83 c0 01          	add    $0x1,%rax
    13b4:	80 38 00             	cmpb   $0x0,(%rax)
    13b7:	75 f7                	jne    13b0 <strip+0x58>
    13b9:	0f 1f 80 00 00 00 00 	nopl   0x0(%rax)
    13c0:	48 89 c6             	mov    %rax,%rsi
    13c3:	48 83 e8 01          	sub    $0x1,%rax
    13c7:	0f b6 08             	movzbl (%rax),%ecx
    13ca:	f6 44 4a 01 20       	testb  $0x20,0x1(%rdx,%rcx,2)
    13cf:	75 ef                	jne    13c0 <strip+0x68>
    13d1:	c6 06 00             	movb   $0x0,(%rsi)
    13d4:	48 29 e8             	sub    %rbp,%rax
    13d7:	48 8d 58 01          	lea    0x1(%rax),%rbx
    13db:	eb aa                	jmp    1387 <strip+0x2f>
    13dd:	48 89 e8             	mov    %rbp,%rax
    13e0:	eb d2                	jmp    13b4 <strip+0x5c>

00000000000013e2 <main>:
    13e2:	41 54                	push   %r12
    13e4:	55                   	push   %rbp
    13e5:	53                   	push   %rbx
    13e6:	48 81 ec 00 01 00 00 	sub    $0x100,%rsp
    13ed:	83 ff 02             	cmp    $0x2,%edi
    13f0:	74 21                	je     1413 <main+0x31>
    13f2:	8b 35 18 3d 00 00    	mov    0x3d18(%rip),%esi        # 5110 <phases_count>
    13f8:	48 8d 3d 09 1c 00 00 	lea    0x1c09(%rip),%rdi        # 3008 <_IO_stdin_used+0x8>
    13ff:	b8 00 00 00 00       	mov    $0x0,%eax
    1404:	e8 27 fc ff ff       	call   1030 <printf@plt>
    1409:	bf 01 00 00 00       	mov    $0x1,%edi
    140e:	e8 0d fd ff ff       	call   1120 <exit@plt>
    1413:	48 89 f3             	mov    %rsi,%rbx
    1416:	48 8d 74 24 08       	lea    0x8(%rsp),%rsi
    141b:	48 8b 7b 08          	mov    0x8(%rbx),%rdi
    141f:	ba 0a 00 00 00       	mov    $0xa,%edx
    1424:	e8 67 fd ff ff       	call   1190 <strtol@plt>
    1429:	48 89 c5             	mov    %rax,%rbp
    142c:	48 8b 73 08          	mov    0x8(%rbx),%rsi
    1430:	48 3b 74 24 08       	cmp    0x8(%rsp),%rsi
    1435:	74 35                	je     146c <main+0x8a>
    1437:	48 85 c0             	test   %rax,%rax
    143a:	7e 0c                	jle    1448 <main+0x66>
    143c:	48 63 05 cd 3c 00 00 	movslq 0x3ccd(%rip),%rax        # 5110 <phases_count>
    1443:	48 39 e8             	cmp    %rbp,%rax
    1446:	7d 3f                	jge    1487 <main+0xa5>
    1448:	8b 15 c2 3c 00 00    	mov    0x3cc2(%rip),%edx        # 5110 <phases_count>
    144e:	48 89 ee             	mov    %rbp,%rsi
    1451:	48 8d 3d 30 1c 00 00 	lea    0x1c30(%rip),%rdi        # 3088 <_IO_stdin_used+0x88>
    1458:	b8 00 00 00 00       	mov    $0x0,%eax
    145d:	e8 ce fb ff ff       	call   1030 <printf@plt>
    1462:	bf 01 00 00 00       	mov    $0x1,%edi
    1467:	e8 b4 fc ff ff       	call   1120 <exit@plt>
    146c:	48 8d 3d dd 1b 00 00 	lea    0x1bdd(%rip),%rdi        # 3050 <_IO_stdin_used+0x50>
    1473:	b8 00 00 00 00       	mov    $0x0,%eax
    1478:	e8 b3 fb ff ff       	call   1030 <printf@plt>
    147d:	bf 01 00 00 00       	mov    $0x1,%edi
    1482:	e8 99 fc ff ff       	call   1120 <exit@plt>
    1487:	89 eb                	mov    %ebp,%ebx
    1489:	4c 8d a4 24 e0 00 00 	lea    0xe0(%rsp),%r12
    1490:	00 
    1491:	89 e9                	mov    %ebp,%ecx
    1493:	48 8d 15 9d 1e 00 00 	lea    0x1e9d(%rip),%rdx        # 3337 <_IO_stdin_used+0x337>
    149a:	be 14 00 00 00       	mov    $0x14,%esi
    149f:	4c 89 e7             	mov    %r12,%rdi
    14a2:	b8 00 00 00 00       	mov    $0x0,%eax
    14a7:	e8 24 fd ff ff       	call   11d0 <snprintf@plt>
    14ac:	be 00 00 00 00       	mov    $0x0,%esi
    14b1:	4c 89 e7             	mov    %r12,%rdi
    14b4:	e8 47 fd ff ff       	call   1200 <access@plt>
    14b9:	85 c0                	test   %eax,%eax
    14bb:	75 1b                	jne    14d8 <main+0xf6>
    14bd:	4c 89 e2             	mov    %r12,%rdx
    14c0:	89 ee                	mov    %ebp,%esi
    14c2:	48 8d 3d f7 1b 00 00 	lea    0x1bf7(%rip),%rdi        # 30c0 <_IO_stdin_used+0xc0>
    14c9:	e8 62 fb ff ff       	call   1030 <printf@plt>
    14ce:	bf 01 00 00 00       	mov    $0x1,%edi
    14d3:	e8 48 fc ff ff       	call   1120 <exit@plt>
    14d8:	b8 00 00 00 00       	mov    $0x0,%eax
    14dd:	e8 99 09 00 00       	call   1e7b <init_driver>
    14e2:	8b 35 28 3c 00 00    	mov    0x3c28(%rip),%esi        # 5110 <phases_count>
    14e8:	48 8d 3d 11 1c 00 00 	lea    0x1c11(%rip),%rdi        # 3100 <_IO_stdin_used+0x100>
    14ef:	b8 00 00 00 00       	mov    $0x0,%eax
    14f4:	e8 37 fb ff ff       	call   1030 <printf@plt>
    14f9:	89 ee                	mov    %ebp,%esi
    14fb:	48 8d 3d 36 1c 00 00 	lea    0x1c36(%rip),%rdi        # 3138 <_IO_stdin_used+0x138>
    1502:	b8 00 00 00 00       	mov    $0x0,%eax
    1507:	e8 24 fb ff ff       	call   1030 <printf@plt>
    150c:	48 8d 3d 2e 1e 00 00 	lea    0x1e2e(%rip),%rdi        # 3341 <_IO_stdin_used+0x341>
    1513:	e8 98 fc ff ff       	call   11b0 <puts@plt>
    1518:	48 8d 7c 24 10       	lea    0x10(%rsp),%rdi
    151d:	48 8b 15 7c 3c 00 00 	mov    0x3c7c(%rip),%rdx        # 51a0 <stdin@GLIBC_2.2.5>
    1524:	be c8 00 00 00       	mov    $0xc8,%esi
    1529:	e8 92 fc ff ff       	call   11c0 <fgets@plt>
    152e:	48 85 c0             	test   %rax,%rax
    1531:	0f 84 c7 00 00 00    	je     15fe <main+0x21c>
    1537:	48 8d 3d 2b 1f 00 00 	lea    0x1f2b(%rip),%rdi        # 3469 <_IO_stdin_used+0x469>
    153e:	e8 6d fc ff ff       	call   11b0 <puts@plt>
    1543:	48 8d 7c 24 10       	lea    0x10(%rsp),%rdi
    1548:	e8 0b fe ff ff       	call   1358 <strip>
    154d:	80 7c 24 10 00       	cmpb   $0x0,0x10(%rsp)
    1552:	0f 84 bc 00 00 00    	je     1614 <main+0x232>
    1558:	83 ed 01             	sub    $0x1,%ebp
    155b:	48 63 ed             	movslq %ebp,%rbp
    155e:	48 8d 7c 24 10       	lea    0x10(%rsp),%rdi
    1563:	48 8d 05 b6 3b 00 00 	lea    0x3bb6(%rip),%rax        # 5120 <phases>
    156a:	ff 14 e8             	call   *(%rax,%rbp,8)
    156d:	85 c0                	test   %eax,%eax
    156f:	0f 85 d8 00 00 00    	jne    164d <main+0x26b>
    1575:	48 8d 54 24 10       	lea    0x10(%rsp),%rdx
    157a:	89 de                	mov    %ebx,%esi
    157c:	bf 01 00 00 00       	mov    $0x1,%edi
    1581:	e8 d9 09 00 00       	call   1f5f <driver_post>
    1586:	48 8d bc 24 e0 00 00 	lea    0xe0(%rsp),%rdi
    158d:	00 
    158e:	48 8d 35 e6 1d 00 00 	lea    0x1de6(%rip),%rsi        # 337b <_IO_stdin_used+0x37b>
    1595:	e8 66 fb ff ff       	call   1100 <fopen@plt>
    159a:	48 89 c5             	mov    %rax,%rbp
    159d:	48 85 c0             	test   %rax,%rax
    15a0:	0f 84 84 00 00 00    	je     162a <main+0x248>
    15a6:	48 8d 7c 24 10       	lea    0x10(%rsp),%rdi
    15ab:	48 89 c6             	mov    %rax,%rsi
    15ae:	e8 2d fb ff ff       	call   10e0 <fputs@plt>
    15b3:	48 89 ee             	mov    %rbp,%rsi
    15b6:	bf 0a 00 00 00       	mov    $0xa,%edi
    15bb:	e8 90 fb ff ff       	call   1150 <fputc@plt>
    15c0:	48 89 ef             	mov    %rbp,%rdi
    15c3:	e8 f8 fa ff ff       	call   10c0 <fclose@plt>
    15c8:	89 de                	mov    %ebx,%esi
    15ca:	48 8d 3d d7 1b 00 00 	lea    0x1bd7(%rip),%rdi        # 31a8 <_IO_stdin_used+0x1a8>
    15d1:	b8 00 00 00 00       	mov    $0x0,%eax
    15d6:	e8 55 fa ff ff       	call   1030 <printf@plt>
    15db:	48 8d b4 24 e0 00 00 	lea    0xe0(%rsp),%rsi
    15e2:	00 
    15e3:	48 8d 3d e6 1b 00 00 	lea    0x1be6(%rip),%rdi        # 31d0 <_IO_stdin_used+0x1d0>
    15ea:	b8 00 00 00 00       	mov    $0x0,%eax
    15ef:	e8 3c fa ff ff       	call   1030 <printf@plt>
    15f4:	bf 00 00 00 00       	mov    $0x0,%edi
    15f9:	e8 22 fb ff ff       	call   1120 <exit@plt>
    15fe:	48 8d 3d 51 1d 00 00 	lea    0x1d51(%rip),%rdi        # 3356 <_IO_stdin_used+0x356>
    1605:	e8 a6 fb ff ff       	call   11b0 <puts@plt>
    160a:	bf 01 00 00 00       	mov    $0x1,%edi
    160f:	e8 0c fb ff ff       	call   1120 <exit@plt>
    1614:	48 8d 3d 4c 1d 00 00 	lea    0x1d4c(%rip),%rdi        # 3367 <_IO_stdin_used+0x367>
    161b:	e8 90 fb ff ff       	call   11b0 <puts@plt>
    1620:	bf 01 00 00 00       	mov    $0x1,%edi
    1625:	e8 f6 fa ff ff       	call   1120 <exit@plt>
    162a:	48 8d b4 24 e0 00 00 	lea    0xe0(%rsp),%rsi
    1631:	00 
    1632:	48 8d 3d 2f 1b 00 00 	lea    0x1b2f(%rip),%rdi        # 3168 <_IO_stdin_used+0x168>
    1639:	b8 00 00 00 00       	mov    $0x0,%eax
    163e:	e8 ed f9 ff ff       	call   1030 <printf@plt>
    1643:	bf 01 00 00 00       	mov    $0x1,%edi
    1648:	e8 d3 fa ff ff       	call   1120 <exit@plt>
    164d:	48 8d 74 24 10       	lea    0x10(%rsp),%rsi
    1652:	89 df                	mov    %ebx,%edi
    1654:	e8 e7 fc ff ff       	call   1340 <explode_bomb>
    1659:	48 8d 3d 1d 1d 00 00 	lea    0x1d1d(%rip),%rdi        # 337d <_IO_stdin_used+0x37d>
    1660:	e8 4b fb ff ff       	call   11b0 <puts@plt>
    1665:	48 8d 3d 22 1d 00 00 	lea    0x1d22(%rip),%rdi        # 338e <_IO_stdin_used+0x38e>
    166c:	e8 3f fb ff ff       	call   11b0 <puts@plt>
    1671:	bf 02 00 00 00       	mov    $0x2,%edi
    1676:	e8 a5 fa ff ff       	call   1120 <exit@plt>
    167b:	0f 1f 44 00 00       	nopl   0x0(%rax,%rax,1)

0000000000001680 <string_length>:
    1680:	b8 00 00 00 00       	mov    $0x0,%eax
    1685:	eb 10                	jmp    1697 <string_length+0x17>
    1687:	66 0f 1f 84 00 00 00 	nopw   0x0(%rax,%rax,1)
    168e:	00 00 
    1690:	48 83 c7 01          	add    $0x1,%rdi
    1694:	83 c0 01             	add    $0x1,%eax
    1697:	80 3f 00             	cmpb   $0x0,(%rdi)
    169a:	75 f4                	jne    1690 <string_length+0x10>
    169c:	c3                   	ret

000000000000169d <strings_not_equal>:
    169d:	41 54                	push   %r12
    169f:	55                   	push   %rbp
    16a0:	53                   	push   %rbx
    16a1:	48 89 fb             	mov    %rdi,%rbx
    16a4:	48 89 f5             	mov    %rsi,%rbp
    16a7:	e8 d4 ff ff ff       	call   1680 <string_length>
    16ac:	41 89 c4             	mov    %eax,%r12d
    16af:	48 89 ef             	mov    %rbp,%rdi
    16b2:	e8 c9 ff ff ff       	call   1680 <string_length>
    16b7:	41 39 c4             	cmp    %eax,%r12d
    16ba:	74 2c                	je     16e8 <strings_not_equal+0x4b>
    16bc:	b8 01 00 00 00       	mov    $0x1,%eax
    16c1:	5b                   	pop    %rbx
    16c2:	5d                   	pop    %rbp
    16c3:	41 5c                	pop    %r12
    16c5:	c3                   	ret
    16c6:	66 66 2e 0f 1f 84 00 	data16 cs nopw 0x0(%rax,%rax,1)
    16cd:	00 00 00 00 
    16d1:	66 66 2e 0f 1f 84 00 	data16 cs nopw 0x0(%rax,%rax,1)
    16d8:	00 00 00 00 
    16dc:	0f 1f 40 00          	nopl   0x0(%rax)
    16e0:	48 83 c3 01          	add    $0x1,%rbx
    16e4:	48 83 c5 01          	add    $0x1,%rbp
    16e8:	0f b6 03             	movzbl (%rbx),%eax
    16eb:	84 c0                	test   %al,%al
    16ed:	74 0c                	je     16fb <strings_not_equal+0x5e>
    16ef:	38 45 00             	cmp    %al,0x0(%rbp)
    16f2:	74 ec                	je     16e0 <strings_not_equal+0x43>
    16f4:	b8 01 00 00 00       	mov    $0x1,%eax
    16f9:	eb c6                	jmp    16c1 <strings_not_equal+0x24>
    16fb:	b8 00 00 00 00       	mov    $0x0,%eax
    1700:	eb bf                	jmp    16c1 <strings_not_equal+0x24>

0000000000001702 <phase1>:
    1702:	48 8d 35 ff 1a 00 00 	lea    0x1aff(%rip),%rsi        # 3208 <_IO_stdin_used+0x208>
    1709:	e8 8f ff ff ff       	call   169d <strings_not_equal>
    170e:	85 c0                	test   %eax,%eax
    1710:	74 05                	je     1717 <phase1+0x15>
    1712:	b8 01 00 00 00       	mov    $0x1,%eax
    1717:	c3                   	ret
    1718:	0f 1f 84 00 00 00 00 	nopl   0x0(%rax,%rax,1)
    171f:	00 

0000000000001720 <string_length>:
    1720:	b8 00 00 00 00       	mov    $0x0,%eax
    1725:	eb 10                	jmp    1737 <string_length+0x17>
    1727:	66 0f 1f 84 00 00 00 	nopw   0x0(%rax,%rax,1)
    172e:	00 00 
    1730:	48 83 c7 01          	add    $0x1,%rdi
    1734:	83 c0 01             	add    $0x1,%eax
    1737:	80 3f 00             	cmpb   $0x0,(%rdi)
    173a:	75 f4                	jne    1730 <string_length+0x10>
    173c:	c3                   	ret

000000000000173d <strings_not_equal>:
    173d:	41 54                	push   %r12
    173f:	55                   	push   %rbp
    1740:	53                   	push   %rbx
    1741:	48 89 fb             	mov    %rdi,%rbx
    1744:	48 89 f5             	mov    %rsi,%rbp
    1747:	e8 d4 ff ff ff       	call   1720 <string_length>
    174c:	41 89 c4             	mov    %eax,%r12d
    174f:	48 89 ef             	mov    %rbp,%rdi
    1752:	e8 c9 ff ff ff       	call   1720 <string_length>
    1757:	41 39 c4             	cmp    %eax,%r12d
    175a:	74 2c                	je     1788 <strings_not_equal+0x4b>
    175c:	b8 01 00 00 00       	mov    $0x1,%eax
    1761:	5b                   	pop    %rbx
    1762:	5d                   	pop    %rbp
    1763:	41 5c                	pop    %r12
    1765:	c3                   	ret
    1766:	66 66 2e 0f 1f 84 00 	data16 cs nopw 0x0(%rax,%rax,1)
    176d:	00 00 00 00 
    1771:	66 66 2e 0f 1f 84 00 	data16 cs nopw 0x0(%rax,%rax,1)
    1778:	00 00 00 00 
    177c:	0f 1f 40 00          	nopl   0x0(%rax)
    1780:	48 83 c3 01          	add    $0x1,%rbx
    1784:	48 83 c5 01          	add    $0x1,%rbp
    1788:	0f b6 03             	movzbl (%rbx),%eax
    178b:	84 c0                	test   %al,%al
    178d:	74 0c                	je     179b <strings_not_equal+0x5e>
    178f:	38 45 00             	cmp    %al,0x0(%rbp)
    1792:	74 ec                	je     1780 <strings_not_equal+0x43>
    1794:	b8 01 00 00 00       	mov    $0x1,%eax
    1799:	eb c6                	jmp    1761 <strings_not_equal+0x24>
    179b:	b8 00 00 00 00       	mov    $0x0,%eax
    17a0:	eb bf                	jmp    1761 <strings_not_equal+0x24>

00000000000017a2 <phase2>:
    17a2:	48 81 ec d8 00 00 00 	sub    $0xd8,%rsp
    17a9:	48 89 e1             	mov    %rsp,%rcx
    17ac:	48 8d 94 24 cc 00 00 	lea    0xcc(%rsp),%rdx
    17b3:	00 
    17b4:	48 8d 35 ea 1b 00 00 	lea    0x1bea(%rip),%rsi        # 33a5 <_IO_stdin_used+0x3a5>
    17bb:	b8 00 00 00 00       	mov    $0x0,%eax
    17c0:	e8 eb f8 ff ff       	call   10b0 <__isoc99_sscanf@plt>
    17c5:	83 f8 02             	cmp    $0x2,%eax
    17c8:	75 2e                	jne    17f8 <phase2+0x56>
    17ca:	81 bc 24 cc 00 00 00 	cmpl   $0x15d17,0xcc(%rsp)
    17d1:	17 5d 01 00 
    17d5:	74 07                	je     17de <phase2+0x3c>
    17d7:	b8 01 00 00 00       	mov    $0x1,%eax
    17dc:	eb 1f                	jmp    17fd <phase2+0x5b>
    17de:	48 89 e7             	mov    %rsp,%rdi
    17e1:	48 8d 35 c6 1b 00 00 	lea    0x1bc6(%rip),%rsi        # 33ae <_IO_stdin_used+0x3ae>
    17e8:	e8 50 ff ff ff       	call   173d <strings_not_equal>
    17ed:	85 c0                	test   %eax,%eax
    17ef:	74 0c                	je     17fd <phase2+0x5b>
    17f1:	b8 01 00 00 00       	mov    $0x1,%eax
    17f6:	eb 05                	jmp    17fd <phase2+0x5b>
    17f8:	b8 01 00 00 00       	mov    $0x1,%eax
    17fd:	48 81 c4 d8 00 00 00 	add    $0xd8,%rsp
    1804:	c3                   	ret

0000000000001805 <phase3>:
    1805:	48 83 ec 18          	sub    $0x18,%rsp
    1809:	48 8d 4c 24 08       	lea    0x8(%rsp),%rcx
    180e:	48 8d 54 24 0c       	lea    0xc(%rsp),%rdx
    1813:	48 8d 35 a4 1b 00 00 	lea    0x1ba4(%rip),%rsi        # 33be <_IO_stdin_used+0x3be>
    181a:	b8 00 00 00 00       	mov    $0x0,%eax
    181f:	e8 8c f8 ff ff       	call   10b0 <__isoc99_sscanf@plt>
    1824:	83 f8 02             	cmp    $0x2,%eax
    1827:	75 1c                	jne    1845 <phase3+0x40>
    1829:	8b 44 24 0c          	mov    0xc(%rsp),%eax
    182d:	8b 54 24 08          	mov    0x8(%rsp),%edx
    1831:	39 d0                	cmp    %edx,%eax
    1833:	7d 1a                	jge    184f <phase3+0x4a>
    1835:	01 d0                	add    %edx,%eax
    1837:	3d a9 5b 00 00       	cmp    $0x5ba9,%eax
    183c:	75 18                	jne    1856 <phase3+0x51>
    183e:	b8 00 00 00 00       	mov    $0x0,%eax
    1843:	eb 05                	jmp    184a <phase3+0x45>
    1845:	b8 01 00 00 00       	mov    $0x1,%eax
    184a:	48 83 c4 18          	add    $0x18,%rsp
    184e:	c3                   	ret
    184f:	b8 01 00 00 00       	mov    $0x1,%eax
    1854:	eb f4                	jmp    184a <phase3+0x45>
    1856:	b8 01 00 00 00       	mov    $0x1,%eax
    185b:	eb ed                	jmp    184a <phase3+0x45>
    185d:	0f 1f 00             	nopl   (%rax)

0000000000001860 <phase4>:
    1860:	48 83 ec 18          	sub    $0x18,%rsp
    1864:	48 8d 54 24 0c       	lea    0xc(%rsp),%rdx
    1869:	48 8d 35 51 1b 00 00 	lea    0x1b51(%rip),%rsi        # 33c1 <_IO_stdin_used+0x3c1>
    1870:	b8 00 00 00 00       	mov    $0x0,%eax
    1875:	e8 36 f8 ff ff       	call   10b0 <__isoc99_sscanf@plt>
    187a:	83 f8 01             	cmp    $0x1,%eax
    187d:	75 2b                	jne    18aa <phase4+0x4a>
    187f:	89 c2                	mov    %eax,%edx
    1881:	b9 00 00 00 00       	mov    $0x0,%ecx
    1886:	eb 0d                	jmp    1895 <phase4+0x35>
    1888:	0f 1f 84 00 00 00 00 	nopl   0x0(%rax,%rax,1)
    188f:	00 
    1890:	01 d1                	add    %edx,%ecx
    1892:	83 c2 01             	add    $0x1,%edx
    1895:	39 54 24 0c          	cmp    %edx,0xc(%rsp)
    1899:	7d f5                	jge    1890 <phase4+0x30>
    189b:	81 f9 c8 de bc 00    	cmp    $0xbcdec8,%ecx
    18a1:	75 0c                	jne    18af <phase4+0x4f>
    18a3:	b8 00 00 00 00       	mov    $0x0,%eax
    18a8:	eb 05                	jmp    18af <phase4+0x4f>
    18aa:	b8 01 00 00 00       	mov    $0x1,%eax
    18af:	48 83 c4 18          	add    $0x18,%rsp
    18b3:	c3                   	ret
    18b4:	66 2e 0f 1f 84 00 00 	cs nopw 0x0(%rax,%rax,1)
    18bb:	00 00 00 
    18be:	66 90                	xchg   %ax,%ax

00000000000018c0 <compute_total>:
    18c0:	b8 00 00 00 00       	mov    $0x0,%eax
    18c5:	ba 00 00 00 00       	mov    $0x0,%edx
    18ca:	eb 2b                	jmp    18f7 <compute_total+0x37>
    18cc:	66 66 2e 0f 1f 84 00 	data16 cs nopw 0x0(%rax,%rax,1)
    18d3:	00 00 00 00 
    18d7:	66 0f 1f 84 00 00 00 	nopw   0x0(%rax,%rax,1)
    18de:	00 00 
    18e0:	48 63 c8             	movslq %eax,%rcx
    18e3:	4c 8d 05 86 1b 00 00 	lea    0x1b86(%rip),%r8        # 3470 <xs>
    18ea:	41 89 f2             	mov    %esi,%r10d
    18ed:	45 03 14 88          	add    (%r8,%rcx,4),%r10d
    18f1:	44 01 d2             	add    %r10d,%edx
    18f4:	83 c0 01             	add    $0x1,%eax
    18f7:	83 f8 03             	cmp    $0x3,%eax
    18fa:	7f 1a                	jg     1916 <compute_total+0x56>
    18fc:	a8 01                	test   $0x1,%al
    18fe:	75 e0                	jne    18e0 <compute_total+0x20>
    1900:	48 63 c8             	movslq %eax,%rcx
    1903:	4c 8d 05 66 1b 00 00 	lea    0x1b66(%rip),%r8        # 3470 <xs>
    190a:	41 89 f9             	mov    %edi,%r9d
    190d:	45 03 0c 88          	add    (%r8,%rcx,4),%r9d
    1911:	44 01 ca             	add    %r9d,%edx
    1914:	eb de                	jmp    18f4 <compute_total+0x34>
    1916:	89 d0                	mov    %edx,%eax
    1918:	c3                   	ret

0000000000001919 <phase5>:
    1919:	48 83 ec 18          	sub    $0x18,%rsp
    191d:	48 8d 4c 24 08       	lea    0x8(%rsp),%rcx
    1922:	48 8d 54 24 0c       	lea    0xc(%rsp),%rdx
    1927:	48 8d 35 90 1a 00 00 	lea    0x1a90(%rip),%rsi        # 33be <_IO_stdin_used+0x3be>
    192e:	b8 00 00 00 00       	mov    $0x0,%eax
    1933:	e8 78 f7 ff ff       	call   10b0 <__isoc99_sscanf@plt>
    1938:	83 f8 02             	cmp    $0x2,%eax
    193b:	75 1b                	jne    1958 <phase5+0x3f>
    193d:	8b 74 24 08          	mov    0x8(%rsp),%esi
    1941:	8b 7c 24 0c          	mov    0xc(%rsp),%edi
    1945:	e8 76 ff ff ff       	call   18c0 <compute_total>
    194a:	3d 33 d6 45 00       	cmp    $0x45d633,%eax
    194f:	75 11                	jne    1962 <phase5+0x49>
    1951:	b8 00 00 00 00       	mov    $0x0,%eax
    1956:	eb 05                	jmp    195d <phase5+0x44>
    1958:	b8 01 00 00 00       	mov    $0x1,%eax
    195d:	48 83 c4 18          	add    $0x18,%rsp
    1961:	c3                   	ret
    1962:	b8 01 00 00 00       	mov    $0x1,%eax
    1967:	eb f4                	jmp    195d <phase5+0x44>
    1969:	66 2e 0f 1f 84 00 00 	cs nopw 0x0(%rax,%rax,1)
    1970:	00 00 00 
    1973:	66 2e 0f 1f 84 00 00 	cs nopw 0x0(%rax,%rax,1)
    197a:	00 00 00 
    197d:	0f 1f 00             	nopl   (%rax)

0000000000001980 <phase6>:
    1980:	48 83 ec 18          	sub    $0x18,%rsp
    1984:	48 8d 54 24 08       	lea    0x8(%rsp),%rdx
    1989:	48 8d 4c 24 0c       	lea    0xc(%rsp),%rcx
    198e:	48 8d 35 29 1a 00 00 	lea    0x1a29(%rip),%rsi        # 33be <_IO_stdin_used+0x3be>
    1995:	b8 00 00 00 00       	mov    $0x0,%eax
    199a:	e8 11 f7 ff ff       	call   10b0 <__isoc99_sscanf@plt>
    199f:	83 f8 02             	cmp    $0x2,%eax
    19a2:	0f 85 ae 00 00 00    	jne    1a56 <phase6+0xd6>
    19a8:	89 c7                	mov    %eax,%edi
    19aa:	44 8b 44 24 08       	mov    0x8(%rsp),%r8d
    19af:	41 8d 80 11 e1 ff ff 	lea    -0x1eef(%r8),%eax
    19b6:	3d 1a 12 00 00       	cmp    $0x121a,%eax
    19bb:	0f 87 9f 00 00 00    	ja     1a60 <phase6+0xe0>
    19c1:	44 8b 4c 24 0c       	mov    0xc(%rsp),%r9d
    19c6:	41 8d 81 11 e1 ff ff 	lea    -0x1eef(%r9),%eax
    19cd:	3d 1a 12 00 00       	cmp    $0x121a,%eax
    19d2:	0f 87 8f 00 00 00    	ja     1a67 <phase6+0xe7>
    19d8:	c7 04 24 01 00 00 00 	movl   $0x1,(%rsp)
    19df:	c7 44 24 04 01 00 00 	movl   $0x1,0x4(%rsp)
    19e6:	00 
    19e7:	be 00 00 00 00       	mov    $0x0,%esi
    19ec:	eb 3f                	jmp    1a2d <phase6+0xad>
    19ee:	66 66 2e 0f 1f 84 00 	data16 cs nopw 0x0(%rax,%rax,1)
    19f5:	00 00 00 00 
    19f9:	0f 1f 80 00 00 00 00 	nopl   0x0(%rax)
    1a00:	83 c1 01             	add    $0x1,%ecx
    1a03:	48 63 c6             	movslq %esi,%rax
    1a06:	8b 44 84 08          	mov    0x8(%rsp,%rax,4),%eax
    1a0a:	89 c2                	mov    %eax,%edx
    1a0c:	c1 ea 1f             	shr    $0x1f,%edx
    1a0f:	01 c2                	add    %eax,%edx
    1a11:	d1 fa                	sar    $1,%edx
    1a13:	39 ca                	cmp    %ecx,%edx
    1a15:	7e 13                	jle    1a2a <phase6+0xaa>
    1a17:	99                   	cltd
    1a18:	f7 f9                	idiv   %ecx
    1a1a:	85 d2                	test   %edx,%edx
    1a1c:	75 e2                	jne    1a00 <phase6+0x80>
    1a1e:	48 63 c6             	movslq %esi,%rax
    1a21:	c7 04 84 00 00 00 00 	movl   $0x0,(%rsp,%rax,4)
    1a28:	eb d6                	jmp    1a00 <phase6+0x80>
    1a2a:	83 c6 01             	add    $0x1,%esi
    1a2d:	83 fe 01             	cmp    $0x1,%esi
    1a30:	7f 04                	jg     1a36 <phase6+0xb6>
    1a32:	89 f9                	mov    %edi,%ecx
    1a34:	eb cd                	jmp    1a03 <phase6+0x83>
    1a36:	83 3c 24 00          	cmpl   $0x0,(%rsp)
    1a3a:	74 32                	je     1a6e <phase6+0xee>
    1a3c:	83 7c 24 04 00       	cmpl   $0x0,0x4(%rsp)
    1a41:	74 32                	je     1a75 <phase6+0xf5>
    1a43:	45 01 c8             	add    %r9d,%r8d
    1a46:	41 81 f8 9c 4e 00 00 	cmp    $0x4e9c,%r8d
    1a4d:	74 2d                	je     1a7c <phase6+0xfc>
    1a4f:	b8 01 00 00 00       	mov    $0x1,%eax
    1a54:	eb 05                	jmp    1a5b <phase6+0xdb>
    1a56:	b8 01 00 00 00       	mov    $0x1,%eax
    1a5b:	48 83 c4 18          	add    $0x18,%rsp
    1a5f:	c3                   	ret
    1a60:	b8 01 00 00 00       	mov    $0x1,%eax
    1a65:	eb f4                	jmp    1a5b <phase6+0xdb>
    1a67:	b8 01 00 00 00       	mov    $0x1,%eax
    1a6c:	eb ed                	jmp    1a5b <phase6+0xdb>
    1a6e:	b8 01 00 00 00       	mov    $0x1,%eax
    1a73:	eb e6                	jmp    1a5b <phase6+0xdb>
    1a75:	b8 01 00 00 00       	mov    $0x1,%eax
    1a7a:	eb df                	jmp    1a5b <phase6+0xdb>
    1a7c:	b8 00 00 00 00       	mov    $0x0,%eax
    1a81:	eb d8                	jmp    1a5b <phase6+0xdb>
    1a83:	66 2e 0f 1f 84 00 00 	cs nopw 0x0(%rax,%rax,1)
    1a8a:	00 00 00 
    1a8d:	66 2e 0f 1f 84 00 00 	cs nopw 0x0(%rax,%rax,1)
    1a94:	00 00 00 
    1a97:	66 2e 0f 1f 84 00 00 	cs nopw 0x0(%rax,%rax,1)
    1a9e:	00 00 00 
    1aa1:	66 2e 0f 1f 84 00 00 	cs nopw 0x0(%rax,%rax,1)
    1aa8:	00 00 00 
    1aab:	66 2e 0f 1f 84 00 00 	cs nopw 0x0(%rax,%rax,1)
    1ab2:	00 00 00 
    1ab5:	66 2e 0f 1f 84 00 00 	cs nopw 0x0(%rax,%rax,1)
    1abc:	00 00 00 
    1abf:	90                   	nop

0000000000001ac0 <hp>:
    1ac0:	8b 05 ca 36 00 00    	mov    0x36ca(%rip),%eax        # 5190 <n>
    1ac6:	8d 50 01             	lea    0x1(%rax),%edx
    1ac9:	89 15 c1 36 00 00    	mov    %edx,0x36c1(%rip)        # 5190 <n>
    1acf:	48 63 c8             	movslq %eax,%rcx
    1ad2:	48 8d 15 87 36 00 00 	lea    0x3687(%rip),%rdx        # 5160 <xs>
    1ad9:	89 3c 8a             	mov    %edi,(%rdx,%rcx,4)
    1adc:	eb 30                	jmp    1b0e <hp+0x4e>
    1ade:	66 66 2e 0f 1f 84 00 	data16 cs nopw 0x0(%rax,%rax,1)
    1ae5:	00 00 00 00 
    1ae9:	66 66 2e 0f 1f 84 00 	data16 cs nopw 0x0(%rax,%rax,1)
    1af0:	00 00 00 00 
    1af4:	66 66 2e 0f 1f 84 00 	data16 cs nopw 0x0(%rax,%rax,1)
    1afb:	00 00 00 00 
    1aff:	90                   	nop
    1b00:	48 98                	cltq
    1b02:	48 8d 35 57 36 00 00 	lea    0x3657(%rip),%rsi        # 5160 <xs>
    1b09:	89 0c 86             	mov    %ecx,(%rsi,%rax,4)
    1b0c:	89 d0                	mov    %edx,%eax
    1b0e:	85 c0                	test   %eax,%eax
    1b10:	7e 16                	jle    1b28 <hp+0x68>
    1b12:	8d 50 ff             	lea    -0x1(%rax),%edx
    1b15:	d1 fa                	sar    $1,%edx
    1b17:	48 63 f2             	movslq %edx,%rsi
    1b1a:	48 8d 0d 3f 36 00 00 	lea    0x363f(%rip),%rcx        # 5160 <xs>
    1b21:	8b 0c b1             	mov    (%rcx,%rsi,4),%ecx
    1b24:	39 cf                	cmp    %ecx,%edi
    1b26:	7c d8                	jl     1b00 <hp+0x40>
    1b28:	48 63 c8             	movslq %eax,%rcx
    1b2b:	48 8d 15 2e 36 00 00 	lea    0x362e(%rip),%rdx        # 5160 <xs>
    1b32:	89 3c 8a             	mov    %edi,(%rdx,%rcx,4)
    1b35:	c3                   	ret

0000000000001b36 <phase7>:
    1b36:	48 83 ec 18          	sub    $0x18,%rsp
    1b3a:	48 8d 4c 24 08       	lea    0x8(%rsp),%rcx
    1b3f:	48 8d 54 24 0c       	lea    0xc(%rsp),%rdx
    1b44:	48 8d 35 73 18 00 00 	lea    0x1873(%rip),%rsi        # 33be <_IO_stdin_used+0x3be>
    1b4b:	b8 00 00 00 00       	mov    $0x0,%eax
    1b50:	e8 5b f5 ff ff       	call   10b0 <__isoc99_sscanf@plt>
    1b55:	83 f8 02             	cmp    $0x2,%eax
    1b58:	74 0a                	je     1b64 <phase7+0x2e>
    1b5a:	b8 01 00 00 00       	mov    $0x1,%eax
    1b5f:	48 83 c4 18          	add    $0x18,%rsp
    1b63:	c3                   	ret
    1b64:	8b 7c 24 0c          	mov    0xc(%rsp),%edi
    1b68:	e8 53 ff ff ff       	call   1ac0 <hp>
    1b6d:	83 f8 0a             	cmp    $0xa,%eax
    1b70:	74 07                	je     1b79 <phase7+0x43>
    1b72:	b8 01 00 00 00       	mov    $0x1,%eax
    1b77:	eb e6                	jmp    1b5f <phase7+0x29>
    1b79:	8b 7c 24 08          	mov    0x8(%rsp),%edi
    1b7d:	e8 3e ff ff ff       	call   1ac0 <hp>
    1b82:	83 f8 05             	cmp    $0x5,%eax
    1b85:	75 07                	jne    1b8e <phase7+0x58>
    1b87:	b8 00 00 00 00       	mov    $0x0,%eax
    1b8c:	eb d1                	jmp    1b5f <phase7+0x29>
    1b8e:	b8 01 00 00 00       	mov    $0x1,%eax
    1b93:	eb ca                	jmp    1b5f <phase7+0x29>

0000000000001b95 <phase8>:
    1b95:	48 83 ec 18          	sub    $0x18,%rsp
    1b99:	48 8d 54 24 0c       	lea    0xc(%rsp),%rdx
    1b9e:	48 8d 35 1f 18 00 00 	lea    0x181f(%rip),%rsi        # 33c4 <_IO_stdin_used+0x3c4>
    1ba5:	b8 00 00 00 00       	mov    $0x0,%eax
    1baa:	e8 01 f5 ff ff       	call   10b0 <__isoc99_sscanf@plt>
    1baf:	83 f8 01             	cmp    $0x1,%eax
    1bb2:	0f 85 57 02 00 00    	jne    1e0f <phase8+0x27a>
    1bb8:	8b 44 24 0c          	mov    0xc(%rsp),%eax
    1bbc:	83 e0 3f             	and    $0x3f,%eax
    1bbf:	48 8d 15 ba 18 00 00 	lea    0x18ba(%rip),%rdx        # 3480 <xs+0x10>
    1bc6:	48 63 04 82          	movslq (%rdx,%rax,4),%rax
    1bca:	48 01 d0             	add    %rdx,%rax
    1bcd:	ff e0                	jmp    *%rax
    1bcf:	b8 16 06 00 00       	mov    $0x616,%eax
    1bd4:	e9 3b 02 00 00       	jmp    1e14 <phase8+0x27f>
    1bd9:	b8 8d 07 00 00       	mov    $0x78d,%eax
    1bde:	e9 31 02 00 00       	jmp    1e14 <phase8+0x27f>
    1be3:	b8 fd 06 00 00       	mov    $0x6fd,%eax
    1be8:	e9 27 02 00 00       	jmp    1e14 <phase8+0x27f>
    1bed:	b8 4e 04 00 00       	mov    $0x44e,%eax
    1bf2:	e9 1d 02 00 00       	jmp    1e14 <phase8+0x27f>
    1bf7:	b8 a3 07 00 00       	mov    $0x7a3,%eax
    1bfc:	e9 13 02 00 00       	jmp    1e14 <phase8+0x27f>
    1c01:	b8 8c 04 00 00       	mov    $0x48c,%eax
    1c06:	e9 09 02 00 00       	jmp    1e14 <phase8+0x27f>
    1c0b:	b8 38 04 00 00       	mov    $0x438,%eax
    1c10:	e9 ff 01 00 00       	jmp    1e14 <phase8+0x27f>
    1c15:	b8 fe 03 00 00       	mov    $0x3fe,%eax
    1c1a:	e9 f5 01 00 00       	jmp    1e14 <phase8+0x27f>
    1c1f:	b8 60 07 00 00       	mov    $0x760,%eax
    1c24:	e9 eb 01 00 00       	jmp    1e14 <phase8+0x27f>
    1c29:	b8 52 04 00 00       	mov    $0x452,%eax
    1c2e:	e9 e1 01 00 00       	jmp    1e14 <phase8+0x27f>
    1c33:	b8 68 06 00 00       	mov    $0x668,%eax
    1c38:	e9 d7 01 00 00       	jmp    1e14 <phase8+0x27f>
    1c3d:	b8 88 07 00 00       	mov    $0x788,%eax
    1c42:	e9 cd 01 00 00       	jmp    1e14 <phase8+0x27f>
    1c47:	b8 90 04 00 00       	mov    $0x490,%eax
    1c4c:	e9 c3 01 00 00       	jmp    1e14 <phase8+0x27f>
    1c51:	b8 a6 06 00 00       	mov    $0x6a6,%eax
    1c56:	e9 b9 01 00 00       	jmp    1e14 <phase8+0x27f>
    1c5b:	b8 79 05 00 00       	mov    $0x579,%eax
    1c60:	e9 af 01 00 00       	jmp    1e14 <phase8+0x27f>
    1c65:	b8 f1 04 00 00       	mov    $0x4f1,%eax
    1c6a:	e9 a5 01 00 00       	jmp    1e14 <phase8+0x27f>
    1c6f:	b8 51 05 00 00       	mov    $0x551,%eax
    1c74:	e9 9b 01 00 00       	jmp    1e14 <phase8+0x27f>
    1c79:	b8 34 05 00 00       	mov    $0x534,%eax
    1c7e:	e9 91 01 00 00       	jmp    1e14 <phase8+0x27f>
    1c83:	b8 b5 05 00 00       	mov    $0x5b5,%eax
    1c88:	e9 87 01 00 00       	jmp    1e14 <phase8+0x27f>
    1c8d:	b8 84 05 00 00       	mov    $0x584,%eax
    1c92:	e9 7d 01 00 00       	jmp    1e14 <phase8+0x27f>
    1c97:	b8 99 04 00 00       	mov    $0x499,%eax
    1c9c:	e9 73 01 00 00       	jmp    1e14 <phase8+0x27f>
    1ca1:	b8 41 07 00 00       	mov    $0x741,%eax
    1ca6:	e9 69 01 00 00       	jmp    1e14 <phase8+0x27f>
    1cab:	b8 f9 06 00 00       	mov    $0x6f9,%eax
    1cb0:	e9 5f 01 00 00       	jmp    1e14 <phase8+0x27f>
    1cb5:	b8 74 05 00 00       	mov    $0x574,%eax
    1cba:	e9 55 01 00 00       	jmp    1e14 <phase8+0x27f>
    1cbf:	b8 98 05 00 00       	mov    $0x598,%eax
    1cc4:	e9 4b 01 00 00       	jmp    1e14 <phase8+0x27f>
    1cc9:	b8 c8 04 00 00       	mov    $0x4c8,%eax
    1cce:	e9 41 01 00 00       	jmp    1e14 <phase8+0x27f>
    1cd3:	b8 92 04 00 00       	mov    $0x492,%eax
    1cd8:	e9 37 01 00 00       	jmp    1e14 <phase8+0x27f>
    1cdd:	b8 35 07 00 00       	mov    $0x735,%eax
    1ce2:	e9 2d 01 00 00       	jmp    1e14 <phase8+0x27f>
    1ce7:	b8 7b 06 00 00       	mov    $0x67b,%eax
    1cec:	e9 23 01 00 00       	jmp    1e14 <phase8+0x27f>
    1cf1:	b8 f8 05 00 00       	mov    $0x5f8,%eax
    1cf6:	e9 19 01 00 00       	jmp    1e14 <phase8+0x27f>
    1cfb:	b8 0f 05 00 00       	mov    $0x50f,%eax
    1d00:	e9 0f 01 00 00       	jmp    1e14 <phase8+0x27f>
    1d05:	b8 31 04 00 00       	mov    $0x431,%eax
    1d0a:	e9 05 01 00 00       	jmp    1e14 <phase8+0x27f>
    1d0f:	b8 ba 05 00 00       	mov    $0x5ba,%eax
    1d14:	e9 fb 00 00 00       	jmp    1e14 <phase8+0x27f>
    1d19:	b8 24 05 00 00       	mov    $0x524,%eax
    1d1e:	e9 f1 00 00 00       	jmp    1e14 <phase8+0x27f>
    1d23:	b8 10 07 00 00       	mov    $0x710,%eax
    1d28:	e9 e7 00 00 00       	jmp    1e14 <phase8+0x27f>
    1d2d:	b8 8f 05 00 00       	mov    $0x58f,%eax
    1d32:	e9 dd 00 00 00       	jmp    1e14 <phase8+0x27f>
    1d37:	b8 cc 05 00 00       	mov    $0x5cc,%eax
    1d3c:	e9 d3 00 00 00       	jmp    1e14 <phase8+0x27f>
    1d41:	b8 c0 07 00 00       	mov    $0x7c0,%eax
    1d46:	e9 c9 00 00 00       	jmp    1e14 <phase8+0x27f>
    1d4b:	b8 39 05 00 00       	mov    $0x539,%eax
    1d50:	e9 bf 00 00 00       	jmp    1e14 <phase8+0x27f>
    1d55:	b8 93 05 00 00       	mov    $0x593,%eax
    1d5a:	e9 b5 00 00 00       	jmp    1e14 <phase8+0x27f>
    1d5f:	b8 0b 05 00 00       	mov    $0x50b,%eax
    1d64:	e9 ab 00 00 00       	jmp    1e14 <phase8+0x27f>
    1d69:	b8 fc 05 00 00       	mov    $0x5fc,%eax
    1d6e:	e9 a1 00 00 00       	jmp    1e14 <phase8+0x27f>
    1d73:	b8 6f 06 00 00       	mov    $0x66f,%eax
    1d78:	e9 97 00 00 00       	jmp    1e14 <phase8+0x27f>
    1d7d:	b8 71 06 00 00       	mov    $0x671,%eax
    1d82:	e9 8d 00 00 00       	jmp    1e14 <phase8+0x27f>
    1d87:	b8 75 04 00 00       	mov    $0x475,%eax
    1d8c:	e9 83 00 00 00       	jmp    1e14 <phase8+0x27f>
    1d91:	b8 00 00 00 00       	mov    $0x0,%eax
    1d96:	eb 7c                	jmp    1e14 <phase8+0x27f>
    1d98:	b8 1e 07 00 00       	mov    $0x71e,%eax
    1d9d:	eb 75                	jmp    1e14 <phase8+0x27f>
    1d9f:	b8 58 05 00 00       	mov    $0x558,%eax
    1da4:	eb 6e                	jmp    1e14 <phase8+0x27f>
    1da6:	b8 36 06 00 00       	mov    $0x636,%eax
    1dab:	eb 67                	jmp    1e14 <phase8+0x27f>
    1dad:	b8 13 05 00 00       	mov    $0x513,%eax
    1db2:	eb 60                	jmp    1e14 <phase8+0x27f>
    1db4:	b8 34 07 00 00       	mov    $0x734,%eax
    1db9:	eb 59                	jmp    1e14 <phase8+0x27f>
    1dbb:	b8 68 05 00 00       	mov    $0x568,%eax
    1dc0:	eb 52                	jmp    1e14 <phase8+0x27f>
    1dc2:	b8 c8 05 00 00       	mov    $0x5c8,%eax
    1dc7:	eb 4b                	jmp    1e14 <phase8+0x27f>
    1dc9:	b8 f9 05 00 00       	mov    $0x5f9,%eax
    1dce:	eb 44                	jmp    1e14 <phase8+0x27f>
    1dd0:	b8 93 04 00 00       	mov    $0x493,%eax
    1dd5:	eb 3d                	jmp    1e14 <phase8+0x27f>
    1dd7:	b8 ca 06 00 00       	mov    $0x6ca,%eax
    1ddc:	eb 36                	jmp    1e14 <phase8+0x27f>
    1dde:	b8 23 04 00 00       	mov    $0x423,%eax
    1de3:	eb 2f                	jmp    1e14 <phase8+0x27f>
    1de5:	b8 73 06 00 00       	mov    $0x673,%eax
    1dea:	eb 28                	jmp    1e14 <phase8+0x27f>
    1dec:	b8 4e 04 00 00       	mov    $0x44e,%eax
    1df1:	eb 21                	jmp    1e14 <phase8+0x27f>
    1df3:	b8 d8 04 00 00       	mov    $0x4d8,%eax
    1df8:	eb 1a                	jmp    1e14 <phase8+0x27f>
    1dfa:	b8 63 07 00 00       	mov    $0x763,%eax
    1dff:	eb 13                	jmp    1e14 <phase8+0x27f>
    1e01:	b8 cc 04 00 00       	mov    $0x4cc,%eax
    1e06:	eb 0c                	jmp    1e14 <phase8+0x27f>
    1e08:	b8 11 07 00 00       	mov    $0x711,%eax
    1e0d:	eb 05                	jmp    1e14 <phase8+0x27f>
    1e0f:	b8 01 00 00 00       	mov    $0x1,%eax
    1e14:	48 83 c4 18          	add    $0x18,%rsp
    1e18:	c3                   	ret
    1e19:	b8 f8 03 00 00       	mov    $0x3f8,%eax
    1e1e:	eb f4                	jmp    1e14 <phase8+0x27f>

0000000000001e20 <append_to_string>:
    1e20:	41 54                	push   %r12
    1e22:	55                   	push   %rbp
    1e23:	53                   	push   %rbx
    1e24:	49 89 fc             	mov    %rdi,%r12
    1e27:	48 89 cb             	mov    %rcx,%rbx
    1e2a:	48 0f af f2          	imul   %rdx,%rsi
    1e2e:	48 89 f5             	mov    %rsi,%rbp
    1e31:	48 03 71 08          	add    0x8(%rcx),%rsi
    1e35:	48 8b 39             	mov    (%rcx),%rdi
    1e38:	48 83 c6 01          	add    $0x1,%rsi
    1e3c:	e8 af f3 ff ff       	call   11f0 <realloc@plt>
    1e41:	48 85 c0             	test   %rax,%rax
    1e44:	74 2e                	je     1e74 <append_to_string+0x54>
    1e46:	48 89 03             	mov    %rax,(%rbx)
    1e49:	48 03 43 08          	add    0x8(%rbx),%rax
    1e4d:	48 89 c7             	mov    %rax,%rdi
    1e50:	48 89 ea             	mov    %rbp,%rdx
    1e53:	4c 89 e6             	mov    %r12,%rsi
    1e56:	e8 45 f2 ff ff       	call   10a0 <memcpy@plt>
    1e5b:	48 89 e8             	mov    %rbp,%rax
    1e5e:	48 03 43 08          	add    0x8(%rbx),%rax
    1e62:	48 89 43 08          	mov    %rax,0x8(%rbx)
    1e66:	48 03 03             	add    (%rbx),%rax
    1e69:	c6 00 00             	movb   $0x0,(%rax)
    1e6c:	48 89 e8             	mov    %rbp,%rax
    1e6f:	5b                   	pop    %rbx
    1e70:	5d                   	pop    %rbp
    1e71:	41 5c                	pop    %r12
    1e73:	c3                   	ret
    1e74:	bd 00 00 00 00       	mov    $0x0,%ebp
    1e79:	eb f1                	jmp    1e6c <append_to_string+0x4c>

0000000000001e7b <init_driver>:
    1e7b:	55                   	push   %rbp
    1e7c:	53                   	push   %rbx
    1e7d:	48 81 ec 08 20 00 00 	sub    $0x2008,%rsp
    1e84:	bf 03 00 00 00       	mov    $0x3,%edi
    1e89:	e8 d2 f1 ff ff       	call   1060 <curl_global_init@plt>
    1e8e:	e8 cd f2 ff ff       	call   1160 <curl_easy_init@plt>
    1e93:	48 85 c0             	test   %rax,%rax
    1e96:	0f 84 85 00 00 00    	je     1f21 <init_driver+0xa6>
    1e9c:	48 89 c3             	mov    %rax,%rbx
    1e9f:	48 89 e5             	mov    %rsp,%rbp
    1ea2:	48 83 ec 08          	sub    $0x8,%rsp
    1ea6:	48 8d 05 f3 13 00 00 	lea    0x13f3(%rip),%rax        # 32a0 <_IO_stdin_used+0x2a0>
    1ead:	50                   	push   %rax
    1eae:	4c 8d 0d 2a 15 00 00 	lea    0x152a(%rip),%r9        # 33df <_IO_stdin_used+0x3df>
    1eb5:	4c 8d 05 2c 15 00 00 	lea    0x152c(%rip),%r8        # 33e8 <_IO_stdin_used+0x3e8>
    1ebc:	b9 bb 01 00 00       	mov    $0x1bb,%ecx
    1ec1:	48 8d 15 88 13 00 00 	lea    0x1388(%rip),%rdx        # 3250 <_IO_stdin_used+0x250>
    1ec8:	48 8d 35 a9 13 00 00 	lea    0x13a9(%rip),%rsi        # 3278 <_IO_stdin_used+0x278>
    1ecf:	48 89 ef             	mov    %rbp,%rdi
    1ed2:	b8 00 00 00 00       	mov    $0x0,%eax
    1ed7:	e8 64 f1 ff ff       	call   1040 <sprintf@plt>
    1edc:	48 89 ea             	mov    %rbp,%rdx
    1edf:	be 12 27 00 00       	mov    $0x2712,%esi
    1ee4:	48 89 df             	mov    %rbx,%rdi
    1ee7:	b8 00 00 00 00       	mov    $0x0,%eax
    1eec:	e8 ff f1 ff ff       	call   10f0 <curl_easy_setopt@plt>
    1ef1:	48 89 df             	mov    %rbx,%rdi
    1ef4:	e8 77 f2 ff ff       	call   1170 <curl_easy_perform@plt>
    1ef9:	48 89 ec             	mov    %rbp,%rsp
    1efc:	85 c0                	test   %eax,%eax
    1efe:	75 4b                	jne    1f4b <init_driver+0xd0>
    1f00:	bd 00 00 00 00       	mov    $0x0,%ebp
    1f05:	48 89 df             	mov    %rbx,%rdi
    1f08:	e8 33 f2 ff ff       	call   1140 <curl_easy_cleanup@plt>
    1f0d:	e8 5e f1 ff ff       	call   1070 <curl_global_cleanup@plt>
    1f12:	48 85 ed             	test   %rbp,%rbp
    1f15:	75 16                	jne    1f2d <init_driver+0xb2>
    1f17:	48 81 c4 08 20 00 00 	add    $0x2008,%rsp
    1f1e:	5b                   	pop    %rbx
    1f1f:	5d                   	pop    %rbp
    1f20:	c3                   	ret
    1f21:	e8 4a f1 ff ff       	call   1070 <curl_global_cleanup@plt>
    1f26:	48 8d 2d 9a 14 00 00 	lea    0x149a(%rip),%rbp        # 33c7 <_IO_stdin_used+0x3c7>
    1f2d:	48 89 ee             	mov    %rbp,%rsi
    1f30:	48 8d 3d 91 13 00 00 	lea    0x1391(%rip),%rdi        # 32c8 <_IO_stdin_used+0x2c8>
    1f37:	b8 00 00 00 00       	mov    $0x0,%eax
    1f3c:	e8 ef f0 ff ff       	call   1030 <printf@plt>
    1f41:	bf 01 00 00 00       	mov    $0x1,%edi
    1f46:	e8 d5 f1 ff ff       	call   1120 <exit@plt>
    1f4b:	89 c7                	mov    %eax,%edi
    1f4d:	e8 4e f2 ff ff       	call   11a0 <curl_easy_strerror@plt>
    1f52:	48 89 c7             	mov    %rax,%rdi
    1f55:	e8 c6 f2 ff ff       	call   1220 <strdup@plt>
    1f5a:	48 89 c5             	mov    %rax,%rbp
    1f5d:	eb a6                	jmp    1f05 <init_driver+0x8a>

0000000000001f5f <driver_post>:
    1f5f:	41 57                	push   %r15
    1f61:	41 56                	push   %r14
    1f63:	41 55                	push   %r13
    1f65:	41 54                	push   %r12
    1f67:	55                   	push   %rbp
    1f68:	53                   	push   %rbx
    1f69:	48 81 ec 28 20 00 00 	sub    $0x2028,%rsp
    1f70:	41 89 fe             	mov    %edi,%r14d
    1f73:	41 89 f5             	mov    %esi,%r13d
    1f76:	49 89 d4             	mov    %rdx,%r12
    1f79:	48 8d 3d a4 14 00 00 	lea    0x14a4(%rip),%rdi        # 3424 <_IO_stdin_used+0x424>
    1f80:	e8 ab f1 ff ff       	call   1130 <getenv@plt>
    1f85:	48 85 c0             	test   %rax,%rax
    1f88:	74 12                	je     1f9c <driver_post+0x3d>
    1f8a:	48 81 c4 28 20 00 00 	add    $0x2028,%rsp
    1f91:	5b                   	pop    %rbx
    1f92:	5d                   	pop    %rbp
    1f93:	41 5c                	pop    %r12
    1f95:	41 5d                	pop    %r13
    1f97:	41 5e                	pop    %r14
    1f99:	41 5f                	pop    %r15
    1f9b:	c3                   	ret
    1f9c:	48 89 c3             	mov    %rax,%rbx
    1f9f:	bf 03 00 00 00       	mov    $0x3,%edi
    1fa4:	e8 b7 f0 ff ff       	call   1060 <curl_global_init@plt>
    1fa9:	e8 b2 f1 ff ff       	call   1160 <curl_easy_init@plt>
    1fae:	48 89 c5             	mov    %rax,%rbp
    1fb1:	48 85 c0             	test   %rax,%rax
    1fb4:	0f 84 3c 01 00 00    	je     20f6 <driver_post+0x197>
    1fba:	ba 00 00 00 00       	mov    $0x0,%edx
    1fbf:	4c 89 e6             	mov    %r12,%rsi
    1fc2:	48 89 c7             	mov    %rax,%rdi
    1fc5:	e8 46 f2 ff ff       	call   1210 <curl_easy_escape@plt>
    1fca:	49 89 c4             	mov    %rax,%r12
    1fcd:	48 85 c0             	test   %rax,%rax
    1fd0:	0f 84 a1 01 00 00    	je     2177 <driver_post+0x218>
    1fd6:	4c 8d 7c 24 20       	lea    0x20(%rsp),%r15
    1fdb:	50                   	push   %rax
    1fdc:	41 56                	push   %r14
    1fde:	41 55                	push   %r13
    1fe0:	48 8d 05 b9 12 00 00 	lea    0x12b9(%rip),%rax        # 32a0 <_IO_stdin_used+0x2a0>
    1fe7:	50                   	push   %rax
    1fe8:	4c 8d 0d f0 13 00 00 	lea    0x13f0(%rip),%r9        # 33df <_IO_stdin_used+0x3df>
    1fef:	4c 8d 05 45 14 00 00 	lea    0x1445(%rip),%r8        # 343b <_IO_stdin_used+0x43b>
    1ff6:	b9 bb 01 00 00       	mov    $0x1bb,%ecx
    1ffb:	48 8d 15 4e 12 00 00 	lea    0x124e(%rip),%rdx        # 3250 <_IO_stdin_used+0x250>
    2002:	48 8d 35 e7 12 00 00 	lea    0x12e7(%rip),%rsi        # 32f0 <_IO_stdin_used+0x2f0>
    2009:	4c 89 ff             	mov    %r15,%rdi
    200c:	b8 00 00 00 00       	mov    $0x0,%eax
    2011:	e8 2a f0 ff ff       	call   1040 <sprintf@plt>
    2016:	48 83 c4 20          	add    $0x20,%rsp
    201a:	be 01 00 00 00       	mov    $0x1,%esi
    201f:	bf 01 00 00 00       	mov    $0x1,%edi
    2024:	e8 67 f0 ff ff       	call   1090 <calloc@plt>
    2029:	48 89 44 24 10       	mov    %rax,0x10(%rsp)
    202e:	48 c7 44 24 18 00 00 	movq   $0x0,0x18(%rsp)
    2035:	00 00 
    2037:	4c 89 fa             	mov    %r15,%rdx
    203a:	be 12 27 00 00       	mov    $0x2712,%esi
    203f:	48 89 ef             	mov    %rbp,%rdi
    2042:	b8 00 00 00 00       	mov    $0x0,%eax
    2047:	e8 a4 f0 ff ff       	call   10f0 <curl_easy_setopt@plt>
    204c:	48 8d 15 16 14 00 00 	lea    0x1416(%rip),%rdx        # 3469 <_IO_stdin_used+0x469>
    2053:	be 1f 27 00 00       	mov    $0x271f,%esi
    2058:	48 89 ef             	mov    %rbp,%rdi
    205b:	b8 00 00 00 00       	mov    $0x0,%eax
    2060:	e8 8b f0 ff ff       	call   10f0 <curl_easy_setopt@plt>
    2065:	48 8d 15 b4 fd ff ff 	lea    -0x24c(%rip),%rdx        # 1e20 <append_to_string>
    206c:	be 2b 4e 00 00       	mov    $0x4e2b,%esi
    2071:	48 89 ef             	mov    %rbp,%rdi
    2074:	b8 00 00 00 00       	mov    $0x0,%eax
    2079:	e8 72 f0 ff ff       	call   10f0 <curl_easy_setopt@plt>
    207e:	48 8d 54 24 10       	lea    0x10(%rsp),%rdx
    2083:	be 11 27 00 00       	mov    $0x2711,%esi
    2088:	48 89 ef             	mov    %rbp,%rdi
    208b:	b8 00 00 00 00       	mov    $0x0,%eax
    2090:	e8 5b f0 ff ff       	call   10f0 <curl_easy_setopt@plt>
    2095:	48 8d 15 b4 13 00 00 	lea    0x13b4(%rip),%rdx        # 3450 <_IO_stdin_used+0x450>
    209c:	be 22 27 00 00       	mov    $0x2722,%esi
    20a1:	48 89 ef             	mov    %rbp,%rdi
    20a4:	b8 00 00 00 00       	mov    $0x0,%eax
    20a9:	e8 42 f0 ff ff       	call   10f0 <curl_easy_setopt@plt>
    20ae:	48 89 ef             	mov    %rbp,%rdi
    20b1:	e8 ba f0 ff ff       	call   1170 <curl_easy_perform@plt>
    20b6:	85 c0                	test   %eax,%eax
    20b8:	74 66                	je     2120 <driver_post+0x1c1>
    20ba:	89 c7                	mov    %eax,%edi
    20bc:	e8 df f0 ff ff       	call   11a0 <curl_easy_strerror@plt>
    20c1:	48 89 c7             	mov    %rax,%rdi
    20c4:	e8 57 f1 ff ff       	call   1220 <strdup@plt>
    20c9:	48 89 c3             	mov    %rax,%rbx
    20cc:	48 8b 7c 24 10       	mov    0x10(%rsp),%rdi
    20d1:	e8 3a f0 ff ff       	call   1110 <free@plt>
    20d6:	4c 89 e7             	mov    %r12,%rdi
    20d9:	e8 72 ef ff ff       	call   1050 <curl_free@plt>
    20de:	48 89 ef             	mov    %rbp,%rdi
    20e1:	e8 5a f0 ff ff       	call   1140 <curl_easy_cleanup@plt>
    20e6:	e8 85 ef ff ff       	call   1070 <curl_global_cleanup@plt>
    20eb:	48 85 db             	test   %rbx,%rbx
    20ee:	0f 84 96 fe ff ff    	je     1f8a <driver_post+0x2b>
    20f4:	eb 0c                	jmp    2102 <driver_post+0x1a3>
    20f6:	e8 75 ef ff ff       	call   1070 <curl_global_cleanup@plt>
    20fb:	48 8d 1d c5 12 00 00 	lea    0x12c5(%rip),%rbx        # 33c7 <_IO_stdin_used+0x3c7>
    2102:	48 89 de             	mov    %rbx,%rsi
    2105:	48 8d 3d 53 13 00 00 	lea    0x1353(%rip),%rdi        # 345f <_IO_stdin_used+0x45f>
    210c:	b8 00 00 00 00       	mov    $0x0,%eax
    2111:	e8 1a ef ff ff       	call   1030 <printf@plt>
    2116:	bf 01 00 00 00       	mov    $0x1,%edi
    211b:	e8 00 f0 ff ff       	call   1120 <exit@plt>
    2120:	48 8d 54 24 08       	lea    0x8(%rsp),%rdx
    2125:	be 02 00 20 00       	mov    $0x200002,%esi
    212a:	48 89 ef             	mov    %rbp,%rdi
    212d:	b8 00 00 00 00       	mov    $0x0,%eax
    2132:	e8 49 ef ff ff       	call   1080 <curl_easy_getinfo@plt>
    2137:	48 81 7c 24 08 c8 00 	cmpq   $0xc8,0x8(%rsp)
    213e:	00 00 
    2140:	74 09                	je     214b <driver_post+0x1ec>
    2142:	48 8d 1d b2 12 00 00 	lea    0x12b2(%rip),%rbx        # 33fb <_IO_stdin_used+0x3fb>
    2149:	eb 81                	jmp    20cc <driver_post+0x16d>
    214b:	4c 8b 6c 24 10       	mov    0x10(%rsp),%r13
    2150:	48 8d 35 05 13 00 00 	lea    0x1305(%rip),%rsi        # 345c <_IO_stdin_used+0x45c>
    2157:	4c 89 ef             	mov    %r13,%rdi
    215a:	e8 21 f0 ff ff       	call   1180 <strcmp@plt>
    215f:	85 c0                	test   %eax,%eax
    2161:	0f 84 65 ff ff ff    	je     20cc <driver_post+0x16d>
    2167:	4c 89 ef             	mov    %r13,%rdi
    216a:	e8 b1 f0 ff ff       	call   1220 <strdup@plt>
    216f:	48 89 c3             	mov    %rax,%rbx
    2172:	e9 55 ff ff ff       	jmp    20cc <driver_post+0x16d>
    2177:	48 8d 1d 8a 12 00 00 	lea    0x128a(%rip),%rbx        # 3408 <_IO_stdin_used+0x408>
    217e:	e9 5b ff ff ff       	jmp    20de <driver_post+0x17f>

Disassembly of section .fini:

0000000000002184 <_fini>:
    2184:	48 83 ec 08          	sub    $0x8,%rsp
    2188:	48 83 c4 08          	add    $0x8,%rsp
    218c:	c3                   	ret
