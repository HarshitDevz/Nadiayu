import re

with open('src/context/MedicalContext.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Prescriptions Realtime Sync
p_old = """  // 4. Real-Time Firestore Synchronization for Prescriptions
  useEffect(() => {
    const prescriptionsRef = collection(db, 'prescriptions');
    const unsubscribe = onSnapshot(prescriptionsRef, (snapshot) => {
      const liveJobs: PrescriptionJob[] = [];
      snapshot.forEach((docSnap) => {
        liveJobs.push({ id: docSnap.id, ...(docSnap.data() as Omit<PrescriptionJob, 'id'>) });
      });
      setPrescriptions(liveJobs);
    }, (error) => {
      console.warn('Firestore prescriptions live listener warning:', error);
    });

    return () => unsubscribe();
  }, []);"""
p_new = """  // 4. Real-Time Supabase Synchronization for Prescriptions
  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase.from('prescriptions').select('*');
      if (data) setPrescriptions(data as any[]);
    };
    fetchJobs();

    const channel = supabase.channel('prescriptions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions' }, fetchJobs)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);"""
content = content.replace(p_old, p_new)

content = re.sub(r"await setDoc\(doc\(db, 'patients', (.*?)\), (.*?)\);", r"await supabase.from('patients').upsert(\2);", content)
content = re.sub(r"await setDoc\(doc\(db, 'prescriptions', (.*?)\), (.*?)\);", r"await supabase.from('prescriptions').upsert(\2);", content)
content = re.sub(r"await setDoc\(doc\(db, 'kyc_applications', (.*?)\), (.*?)\);", r"await supabase.from('kyc_applications').upsert(\2);", content)

content = re.sub(r"await deleteDoc\(doc\(db, 'patients', (.*?)\)\);?", r"await supabase.from('patients').delete().eq('id', \1);", content)
content = re.sub(r"await deleteDoc\(doc\(db, 'kyc_applications', (.*?)\)\);?", r"await supabase.from('kyc_applications').delete().eq('id', \1);", content)
content = re.sub(r"await deleteDoc\(doc\(db, 'prescriptions', (.*?)\)\);?", r"await supabase.from('prescriptions').delete().eq('id', \1);", content)
content = re.sub(r"\.catch\(\(\) => \{ \}\)", "", content)

with open('src/context/MedicalContext.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
