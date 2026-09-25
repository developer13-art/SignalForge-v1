import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Building2, Shield } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import FormField from '../../components/forms/FormField';
import Alert from '../../components/feedback/Alert';

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    title: 'Email',
    value: 'hello@signalforge.ai',
    description: 'General inquiries and questions',
  },
  {
    icon: MessageSquare,
    title: 'Support',
    value: 'support@signalforge.ai',
    description: 'Technical and account support',
  },
  {
    icon: Shield,
    title: 'Security',
    value: 'security@signalforge.ai',
    description: 'Confidential security reports',
  },
  {
    icon: Building2,
    title: 'Enterprise',
    value: 'enterprise@signalforge.ai',
    description: 'Enterprise and white label inquiries',
  },
];

const Contact = function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Name is required';
    }
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!form.subject.trim()) {
      nextErrors.subject = 'Subject is required';
    }
    if (!form.message.trim()) {
      nextErrors.message = 'Message is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
    } catch (_error) {
      setErrors({ submit: 'Failed to send message. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" size="sm">
              Contact
            </Badge>
            <Heading level={1} className="mt-4">
              Get in touch with SignalForge AI
            </Heading>
            <Text size="lg" color="muted" className="mt-4">
              Whether you have a question about features, pricing, partnerships, or security, our
              team is here to help.
            </Text>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container size="xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {CONTACT_CHANNELS.map((channel) => {
              const Icon = channel.icon;
              return (
                <Card key={channel.title} padding="lg">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{channel.title}</h3>
                  <p className="mt-1 text-sm font-medium text-indigo-600">{channel.value}</p>
                  <p className="mt-2 text-xs text-slate-500">{channel.description}</p>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-20">
        <Container size="lg">
          <Card padding="lg" variant="elevated">
            {submitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Mail size={24} aria-hidden="true" />
                </div>
                <Heading level={3} className="mt-4">
                  Message sent
                </Heading>
                <Text color="muted" className="mt-2">
                  Thank you for reaching out. Our team will respond within 1 business day.
                </Text>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Heading level={3}>Send us a message</Heading>
                  <Text color="muted" className="mt-1">
                    Fill out the form below and we will get back to you shortly.
                  </Text>
                </div>

                {errors.submit ? (
                  <Alert variant="danger" size="sm">
                    {errors.submit}
                  </Alert>
                ) : null}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Name" error={errors.name} required>
                    {({ id }) => (
                      <input
                        id={id}
                        type="text"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    )}
                  </FormField>

                  <FormField label="Email" error={errors.email} required>
                    {({ id }) => (
                      <input
                        id={id}
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    )}
                  </FormField>
                </div>

                <FormField label="Subject" error={errors.subject} required>
                  {({ id }) => (
                    <input
                      id={id}
                      type="text"
                      value={form.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  )}
                </FormField>

                <FormField label="Message" error={errors.message} required>
                  {({ id }) => (
                    <textarea
                      id={id}
                      rows={6}
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  )}
                </FormField>

                <div className="flex justify-end">
                  <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container size="lg">
          <Card padding="lg">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="mt-1 shrink-0 text-slate-400" aria-hidden="true" />
              <div>
                <p className="text-base font-semibold text-slate-900">Office</p>
                <p className="mt-1 text-sm text-slate-600">
                  SignalForge AI Headquarters
                  <br />
                  Remote-first, globally distributed
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <Phone size={12} aria-hidden="true" />
                  Enterprise customers receive direct phone support
                </p>
              </div>
            </div>
          </Card>
        </Container>
      </section>
    </div>
  );
};

export default Contact;