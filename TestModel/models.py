
# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.IntegerField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.IntegerField()
    is_active = models.IntegerField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class ForBiliUsersData(models.Model):
    username = models.CharField(max_length=20, blank=True, null=True)
    user_set = models.TextField(blank=True, null=True)
    music_name = models.CharField(max_length=9000, blank=True, null=True)
    now_music_url = models.CharField(max_length=1000, blank=True, null=True)
    lyric_name = models.TextField(blank=True, null=True)
    who_play = models.IntegerField(blank=True, null=True)
    play = models.IntegerField(blank=True, null=True)
    replay = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'for_bili_users_data'


class ForBiliUsersInfo(models.Model):
    username = models.CharField(max_length=45)
    password = models.CharField(max_length=45)
    is_admin = models.IntegerField(blank=True, null=True)
    music_url = models.CharField(max_length=30, blank=True, null=True)
    lyric_url = models.CharField(max_length=30, blank=True, null=True)
    is_running = models.CharField(max_length=6, blank=True, null=True)
    room_id = models.CharField(max_length=12, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'for_bili_users_info'


class Message(models.Model):
    username = models.CharField(unique=True, max_length=20, blank=True, null=True)
    msg = models.TextField(blank=True, null=True)
    read = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'message'


class Urls(models.Model):
    session_key = models.CharField(primary_key=True, max_length=50)
    lyric_url = models.CharField(max_length=30)
    music_url = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = 'urls'


class UsersData(models.Model):
    console_info = models.TextField(blank=True, null=True)
    username = models.CharField(max_length=20, blank=True, null=True)
    music_name = models.CharField(max_length=9000, blank=True, null=True)
    now_music_url = models.CharField(max_length=1000, blank=True, null=True)
    lyric_name = models.TextField(blank=True, null=True)
    who_play = models.IntegerField(blank=True, null=True)
    replay = models.IntegerField(blank=True, null=True)
    play = models.IntegerField(blank=True, null=True)
    user_set = models.TextField(blank=True, null=True)
    sessions = models.TextField(blank=True, null=True)
    global_setting = models.TextField(blank=True, null=True)
    login_status = models.CharField(max_length=60, blank=True, null=True)
    # user_playlist = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'users_data'


class UsersInfo(models.Model):
    username = models.CharField(max_length=45)
    password = models.CharField(max_length=45)
    is_admin = models.IntegerField(blank=True, null=True)
    music_url = models.CharField(max_length=30, blank=True, null=True)
    lyric_url = models.CharField(max_length=30, blank=True, null=True)
    is_running = models.CharField(max_length=6, blank=True, null=True)
    room_id = models.CharField(max_length=12, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'users_info'


class Lottery(models.Model):
    uid = models.CharField(unique=True, max_length=50)
    room_id = models.CharField(unique=True, max_length=20, blank=True, null=True)
    settings = models.TextField(blank=True, null=True)
    auth_code = models.CharField(max_length=50, blank=True, null=True)
    history = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'lottery'


class ObsPet(models.Model):
    username = models.CharField(primary_key=True, max_length=20)
    images = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'OBS_Pet'
