import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiSend } from 'react-icons/fi'

const initialValues = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

const validate = (values) => {
  const errors = {}

  if (values.name.trim().length < 2) errors.name = 'Enter at least 2 characters.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address.'
  if (values.subject.trim().length < 4) errors.subject = 'Add a short subject.'
  if (values.message.trim().length < 12) errors.message = 'Write at least 12 characters.'

  return errors
}

export default function ContactForm() {
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState({})
  const [sent, setSent] = useState(false)
  const errors = useMemo(() => validate(values), [values])
  const isValid = Object.keys(errors).length === 0

  const updateField = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setSent(false)
  }

  const submitForm = (event) => {
    event.preventDefault()
    setTouched({ name: true, email: true, subject: true, message: true })

    if (!isValid) return

    setSent(true)
    setValues(initialValues)
    setTouched({})
  }

  return (
    <form className="contact-form" onSubmit={submitForm} noValidate>
      {Object.entries(initialValues).map(([name]) => {
        const isMessage = name === 'message'
        const label = name[0].toUpperCase() + name.slice(1)
        const showError = touched[name] && errors[name]
        const sharedProps = {
          id: name,
          name,
          value: values[name],
          onChange: updateField,
          onBlur: () => setTouched((current) => ({ ...current, [name]: true })),
          'aria-invalid': Boolean(showError),
          'aria-describedby': showError ? `${name}-error` : undefined,
          placeholder:
            name === 'email'
              ? 'you@example.com'
              : name === 'message'
                ? 'Tell me about the opportunity or project.'
                : label,
        }

        return (
          <label key={name} className={isMessage ? 'md:col-span-2' : undefined}>
            <span>{label}</span>
            {isMessage ? (
              <textarea rows="6" {...sharedProps} />
            ) : (
              <input type={name === 'email' ? 'email' : 'text'} {...sharedProps} />
            )}
            {showError ? <small id={`${name}-error`}>{errors[name]}</small> : null}
          </label>
        )
      })}

      <div className="form-footer md:col-span-2">
        <button className="btn btn-primary" type="submit">
          <FiSend aria-hidden="true" />
          <span>Send Message</span>
        </button>
        {sent ? (
          <motion.p className="success-message" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <FiCheckCircle aria-hidden="true" />
            Message sent successfully.
          </motion.p>
        ) : null}
      </div>
    </form>
  )
}
