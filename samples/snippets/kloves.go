func Hash(v generator.Vars, salt string) string {
  s := salt
  if l := v.LayoutName(); l != generator.DefaultLayout {
    s += ":" + l
  }
  for _, d := range v.Fingers() {
    s += fmt.Sprintf(":%.6f", d)
  }
  h := sha256.Sum256([]byte(s))
  return fmt.Sprintf("%x", h[:8])
}