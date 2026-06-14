# CV Design Axes, generating a unique cv_design.md

Every JobPilot user gets their **own** CV design so no two users ship the same-looking
resume. You generate `cv-creation/references/cv_design.md` by picking one option per axis
below, then writing a complete design file in the EXACT structure of the template at the
bottom. The cv-creation agent follows that file verbatim, so every option here is
complete, valid python-docx code, not an adjective.

## Picking options

1. **Seed deterministically.** Take the owner's full name + email, lowercase, sum the
   character codes → `N`. Then:
   - Axis A (fonts, 5 options): `N mod 5`
   - Axis B (palette, 8): `(N // 5) mod 8`
   - Axis C (header layout, 3): `(N // 40) mod 3`
   - Axis D (section headers, 3): `(N // 120) mod 3`
   - Axis E (bullet glyph, 3): `(N // 360) mod 3`
   - Axis F (spacing, 3): `(N // 1080) mod 3`
2. **Then apply the taste answers** (they override the seed):
   - "conservative" → force Axis A ∈ {1, 3} (serif-led), Axis B ∈ {navy, charcoal, slate},
     Axis C = centered, Axis D = bordered
   - "modern" → force Axis A ∈ {0, 4} (sans-led), Axis C = left-aligned allowed
   - "monochrome" → Axis B = charcoal
   - a named color preference → nearest palette
3. Record the chosen options in a comment at the top of the generated file so a future
   regeneration can be told "same but with X changed".

1080 combinations; collisions across users are effectively zero, and every combination
stays ATS-safe (single column, no tables, no graphics, real text).

---

## Axis A, Font pairing (HEAD_FONT for name+sections, BODY_FONT for text)

All fonts ship with Windows/Office and convert cleanly via LibreOffice.

| # | HEAD_FONT | BODY_FONT | feel |
|---|---|---|---|
| 0 | `'Calibri'` | `'Calibri'` | modern minimal |
| 1 | `'Cambria'` | `'Calibri'` | serif headers, sans body |
| 2 | `'Georgia'` | `'Segoe UI'` | editorial |
| 3 | `'Garamond'` | `'Garamond'` | classic all-serif |
| 4 | `'Segoe UI'` | `'Segoe UI'` | contemporary clean |

```python
HEAD_FONT = '<from table>'
BODY_FONT = '<from table>'
```
Body size stays Pt(10); name size: serif HEAD_FONT → Pt(23), sans → Pt(22).

## Axis B, Accent palette (ACCENT colors name + section headers; RULE = border hex)

| # | name | ACCENT (RGB tuple) | RULE hex |
|---|---|---|---|
| 0 | navy | `(0x1B, 0x35, 0x5E)` | `'1B355E'` |
| 1 | charcoal | `(0x2B, 0x2B, 0x2B)` | `'2B2B2B'` |
| 2 | forest | `(0x1F, 0x4D, 0x3A)` | `'1F4D3A'` |
| 3 | burgundy | `(0x6B, 0x1F, 0x32)` | `'6B1F32'` |
| 4 | slate | `(0x32, 0x44, 0x5C)` | `'32445C'` |
| 5 | teal | `(0x0F, 0x4C, 0x5C)` | `'0F4C5C'` |
| 6 | plum | `(0x47, 0x28, 0x46)` | `'472846'` |
| 7 | bronze | `(0x6E, 0x4A, 0x1F)` | `'6E4A1F'` |

Always with: `BODY = (0x22, 0x22, 0x22)`, `META = (0x60, 0x60, 0x60)`.

## Axis C, Header layout (complete code per option; contact line uses PROFILE.md facts)

**0, Centered with top accent bar** (bar → centered name → role line → contact line):
```python
bar = doc.add_paragraph()
bar.alignment = WD_ALIGN_PARAGRAPH.CENTER
spacing(bar, before=0, after=0)
add_top_border(bar, sz='24')

name_p = doc.add_paragraph()
name_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
spacing(name_p, before=60, after=10)
txt(name_p, OWNER_NAME, bold=True, size=NAME_SIZE, color=ACCENT, font=HEAD_FONT)

sub_p = doc.add_paragraph()
sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
spacing(sub_p, before=0, after=14)
txt(sub_p, ROLE_TITLE, size=10.5, color=META)

con_p = doc.add_paragraph()
con_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
spacing(con_p, before=0, after=10)
txt(con_p, CONTACT_LINE, size=8.5, color=META)
```

**1, Left-aligned with rule under header** (name left, role right-tabbed on the same
line, contact under, single bottom border closing the block):
```python
name_p = doc.add_paragraph()
spacing(name_p, before=0, after=4)
right_tab(name_p)
txt(name_p, OWNER_NAME, bold=True, size=NAME_SIZE, color=ACCENT, font=HEAD_FONT)
txt(name_p, '\t' + ROLE_TITLE, size=10.5, color=META)

con_p = doc.add_paragraph()
spacing(con_p, before=0, after=12)
add_bottom_border(con_p, sz='8')
txt(con_p, CONTACT_LINE, size=8.5, color=META)
```

**2, Centered, double thin rules** (name → contact → thin border, no top bar):
```python
name_p = doc.add_paragraph()
name_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
spacing(name_p, before=0, after=8)
txt(name_p, OWNER_NAME, bold=True, size=NAME_SIZE, color=ACCENT, font=HEAD_FONT)

sub_p = doc.add_paragraph()
sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
spacing(sub_p, before=0, after=6)
txt(sub_p, ROLE_TITLE, size=10.5, color=META)

con_p = doc.add_paragraph()
con_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
spacing(con_p, before=0, after=8)
add_bottom_border(con_p, color=RULE, sz='4')
txt(con_p, CONTACT_LINE, size=8.5, color=META)
```

`CONTACT_LINE = 'City, Country  |  phone  |  email  |  link1  |  link2'` (from PROFILE.md;
only links the owner approved).

## Axis D, Section header treatment (replaces `section_head`)

**0, Bordered uppercase** (thin bottom border):
```python
def section_head(doc, title):
    p = doc.add_paragraph()
    spacing(p, before=SEC_BEFORE, after=SEC_AFTER)
    add_bottom_border(p, sz='4')
    txt(p, title.upper(), bold=True, size=10, color=ACCENT, font=HEAD_FONT)
    return p
```

**1, Open uppercase** (no border, accent, extra air):
```python
def section_head(doc, title):
    p = doc.add_paragraph()
    spacing(p, before=SEC_BEFORE + 20, after=SEC_AFTER)
    txt(p, title.upper(), bold=True, size=10.5, color=ACCENT, font=HEAD_FONT)
    return p
```

**2, Thick-rule title case**:
```python
def section_head(doc, title):
    p = doc.add_paragraph()
    spacing(p, before=SEC_BEFORE, after=SEC_AFTER)
    add_bottom_border(p, sz='12')
    txt(p, title, bold=True, size=10.5, color=ACCENT, font=HEAD_FONT)
    return p
```

## Axis E, Bullet glyph (inside `bullet_para`)

| # | glyph code |
|---|---|
| 0 | `'-  '` |
| 1 | `'•  '` |
| 2 | `'–  '` |

## Axis F, Spacing preset

| # | name | SEC_BEFORE | SEC_AFTER | BULLET_AFTER | ROLE_BEFORE | ORG_AFTER |
|---|---|---|---|---|---|---|
| 0 | compact | 70 | 30 | 10 | 50 | 12 |
| 1 | regular | 90 | 40 | 14 | 70 | 18 |
| 2 | airy | 110 | 50 | 18 | 80 | 22 |

(The 1-page tuning ladder in the template reduces from whichever preset was chosen.)

---

## Template for the generated file

Write `cv-creation/references/cv_design.md` with EXACTLY these sections, substituting the
chosen axis values. Everything not governed by an axis is copied unchanged from this list:

1. Title + provenance comment (chosen axes, seed inputs NOT included, just option numbers)
2. **Page Setup**, margins 0.6/0.75 as in the reference block, `CONTENT_W = 10080`
3. **Colour Palette**, ACCENT/BODY/META/RULE from Axis B
4. **Base Font**, BODY_FONT @ Pt(10); note `txt()` takes an optional `font=` kwarg:
   ```python
   def txt(para, text, bold=False, italic=False, size=None, color=None, font=None):
       r = para.add_run(text)
       r.bold = bold
       r.italic = italic
       if size:  r.font.size = Pt(size)
       if color: r.font.color.rgb = RGBColor(*color)
       if font:  r.font.name = font
       return r
   ```
5. **Helper Functions**, `spacing`, `txt` (above), `add_bottom_border`, `add_top_border`,
   `right_tab`, `bullet_para` (with Axis E glyph + BULLET_AFTER), `section_head` (Axis D),
   `role_line` (ROLE_BEFORE), `org_line` (ORG_AFTER), same implementations as the
   reference design, only the axis constants substituted
6. **Header Template**, Axis C block
7. **Spacing Tuning ladder**, the 6-step reduction list, starting from the Axis F preset;
   keep the two hard rules (never shrink fonts below Pt(10) body; never cut content
   without asking the owner)
8. **Save and Verify**, save `resume.docx`, convert with LibreOffice, check
   `pdfinfo … | grep Pages` shows `Pages: 1`
9. **Section Order**, Header, Summary, Experience, Education, Projects (if relevant),
   Skills, omit a section only when it hurts relevance, never just for space
