# ⚡ Stage 6B Quick Start Guide

## 🎯 Get Started in 5 Minutes

### Step 1: Run Database Migration ⚙️

1. Open **Supabase Dashboard**
2. Go to **SQL Editor** → **New Query**
3. Copy and paste contents from `DATABASE_REMINDERS_6B_MIGRATION.sql`
4. Click **Run** button
5. Verify success message

**Quick verify:**
```sql
SELECT COUNT(*) FROM reminder_templates;
-- Should return 8 (built-in templates)
```

---

### Step 2: Install Dependencies 📦

```bash
npm install
```

Already installed if you ran it during Stage 6B implementation!

**Dependencies added:**
- `react-calendar` - Calendar component
- `chart.js` + `react-chartjs-2` - Charts
- `jspdf` + `jspdf-autotable` - PDF export
- `date-fns` - Date utilities

---

### Step 3: Start the App 🚀

```bash
npm run dev
```

Navigate to: `http://localhost:5173/reminders`

---

## 🎨 Quick Feature Tour

### 1. Calendar View (30 seconds)

1. Click **📅 Calendar** tab
2. See all your reminders on calendar
3. Click any date to view that day's reminders
4. Click a reminder to edit it

**Tips:**
- Color dots = reminder types
- Numbers = reminder count
- Today is highlighted in yellow

---

### 2. Statistics Dashboard (1 minute)

1. Click **📊 Statistics** tab
2. View your adherence rate
3. See 30-day trend chart
4. Check distribution pie chart
5. Read personalized insights

**Export Report:**
- Click **📄 Export PDF** button
- Instant download of full report

---

### 3. Import Prescription (2 minutes)

1. Click **📋 Import Prescription** button
2. Upload a prescription image (JPG/PNG)
3. Click **Process Prescription**
4. Wait 5-15 seconds for OCR
5. Review extracted medications
6. Click **Import Reminders**

**Best Results:**
- Use clear, well-lit photos
- Typed prescriptions work best
- Crop to prescription area
- Avoid shadows/glare

---

### 4. Use Smart Templates (30 seconds)

1. Click **📝 Use Template** button
2. Browse 8 built-in templates:
   - Twice Daily
   - Three Times Daily
   - Every 8 Hours
   - With Meals
   - Before Bed
   - Weekly Vitamin
   - Weekday Morning
   - Monthly Checkup
3. Click template to auto-fill form
4. Customize and save!

---

### 5. Configure Settings (1 minute)

1. Click **⚙️ Settings** button
2. Set **Quiet Hours** (e.g., 10PM - 7AM)
3. Toggle notification sound/vibration
4. Set email preferences
5. Choose calendar view default
6. Click **Save Settings**

**Quiet Hours:**
- Prevents notifications during sleep
- Automatically handles overnight periods
- Saved per user

---

### 6. Export to PDF (10 seconds)

**Reminder List:**
1. Apply filters (optional)
2. Click **📄 Export PDF** in quick actions
3. Instant download!

**Adherence Report:**
1. Go to Statistics tab
2. Click **📄 Export PDF**
3. Full report with charts!

---

## 🔥 Pro Tips

### Maximize OCR Accuracy
```
✅ DO:
- Use high resolution images
- Ensure good lighting
- Crop to prescription only
- Use typed prescriptions

❌ DON'T:
- Upload blurry images
- Include multiple pages
- Use handwritten notes (less accurate)
- Expect 100% accuracy (always review!)
```

### Chart Not Showing?
```
Empty charts mean no data yet!
✅ Mark some reminders as "taken" or "missed"
✅ Wait 24 hours for meaningful trends
✅ Use test data during development
```

### Templates Not Your Style?
```
Templates are starting points!
✅ Select closest template
✅ Customize times/frequency
✅ Add your own instructions
✅ Save as new reminder
```

---

## 🎓 Common Workflows

### Workflow 1: New Prescription

```
1. Doctor gives prescription
2. Take photo with phone
3. Open MediQ → Reminders
4. Import Prescription → Upload photo
5. Review extracted meds
6. Import all or edit individually
7. Done! ✅
```

### Workflow 2: Weekly Review

```
1. Open Statistics tab
2. Check adherence rate
3. Review insights
4. Export PDF report
5. Share with doctor (optional)
6. Adjust reminders if needed
```

### Workflow 3: Quick Add Reminder

```
1. Click "Use Template"
2. Select "Twice Daily" 
3. Enter medication name
4. Enter dosage
5. Save
6. Done in 15 seconds! ✅
```

---

## 🎯 Feature Checklist

Test all features after setup:

**Calendar View:**
- [ ] Month displays correctly
- [ ] Can select dates
- [ ] Reminders show on dates
- [ ] Colors are visible

**Statistics:**
- [ ] Charts load (or show "no data")
- [ ] Can export PDF
- [ ] Insights display

**OCR Import:**
- [ ] Can upload image
- [ ] Processing works
- [ ] Can import suggestions

**Templates:**
- [ ] Can browse templates
- [ ] Clicking applies to form
- [ ] All 8 templates present

**Settings:**
- [ ] Can toggle quiet hours
- [ ] Time pickers work
- [ ] Settings save

**PDF Export:**
- [ ] Reminder list downloads
- [ ] Adherence report downloads

---

## 🐛 Quick Troubleshooting

### Charts Not Showing
**Fix:** Add some reminder logs first. Go to a reminder and mark it as "Taken" or "Missed".

### OCR Failed
**Fix:** Try a different image. Ensure it's clear and well-lit.

### Templates Empty
**Fix:** Re-run database migration. Templates should auto-populate.

### PDF Won't Download
**Fix:** Check browser pop-up blocker. Allow downloads from localhost.

### Quiet Hours Not Working
**Fix:** Check that "Enable Quiet Hours" toggle is ON. Verify time format.

---

## 📊 Sample Data for Testing

### Test Adherence Stats

Manually add some logs to see charts:

1. Create a reminder
2. Open reminder card
3. Click "Mark as Taken" multiple times
4. Also mark some as "Missed"
5. Go to Statistics tab
6. Charts should now display!

### Test Calendar

Create reminders with different dates:
- Today
- Tomorrow  
- Next week
- Next month

Then view calendar to see distribution.

---

## 🎉 You're All Set!

Stage 6B is now fully operational with:

✅ Calendar view  
✅ Statistics & charts  
✅ OCR prescription import  
✅ Smart templates  
✅ Quiet hours & settings  
✅ PDF export  

**Explore and enjoy!** 🚀

---

## 📚 Learn More

- **Full Documentation:** `STAGE_6B_IMPLEMENTATION_GUIDE.md`
- **User Guide:** `REMINDERS_USER_GUIDE.md`
- **Database Schema:** `DATABASE_REMINDERS_6B_MIGRATION.sql`

---

## 💡 Next Steps

1. Customize template colors
2. Add your own templates to database
3. Integrate with email service for reports
4. Deploy to production
5. Share with users!

**Happy building!** 🎊

