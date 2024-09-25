# Windows Vista 2024 Edition

## В данной работе я попытался претворить концепт "Windows Vista 2022 - The "Wow" is back" за авторством AR 4789 в жизнь!
### Для тех, кто хочет улучшить что либо в интерфейсе - в папке "Images" представлены обновленные элементы (картинки и файлы проекта в GIMP), а так же представлены старые иконки, которые были заменены на новые.

## В данной работе реализовано:

1. Обновлён значок кнопки "Пуск" (Start11).
2. Обновлено меню пуск (практически как в концепте, Start11).
3. Обновлена текстура панели задач с эффектом прозрачности (Start11).
4. Перенесены звуки из Windows Vista.
5. Перенесена панель гаджетов из Windows Vista + обновлены значки в соответсвии с концептом (не идеально, но как смог).
6. Добавлен эффект прозрачности и размытия к окнам "Проводника" и остальных программ средствами DWMBlurGlass и ExplorerBlurMica (по большей части у остальных приложений и программ размываются только верхние части окон).
7. В "Проводнике" теперь указывается в нижней части окна информация о выбранной папке или файле, как в Windows Vista (OldNewExplorer).
8. В "winver" заменен логотип Windows 11 на Windows Vista 2024 Edition, в том же стиле как и в концепте (заменить текст не удалось).

# Для воссоздания данной темы есть 2 способа - ручной и установка .iso образа.

# Ручной способ (настоятельно рекомендую перед началом выставить темную тему, поскольку темная тема наиболее удобна и лучше совмещается с темой Windows Vista 2024 Edition):

## Основные шаги:

Данные шаги являются основой темы, их рекомендуется выполнить обязательно.

1. Скачать ZIP архив репозитория и распаковать его.
2. Перейти в папку OldNewExplorer, распаковать архив в любое удобное место, запустить программу и повторить настройки из скриншота, нажать кнопку "Install".
3. Перейти в папку DWMBlurGlass, распаковать архив в любое удобное место, запустить программу, перейти в раздел "Символы" и нажать на кнопку "Скачать" (символы придётся скачивать каждый раз после очередного обновления Windows), перейти в раздел "Настройка" и произвести импорт файла конфигурации, который был вместе с архивом. После импорта перейти в раздел "Общие" и нажать кнопку "Установить".
4. Перейти в папку Mica Explorer и запустить "register" (в файле config можно корректировать настройки, по умолчанию там мой пресет).
5. Установить [Start11]([https://neon.tech/](https://www.stardock.com/products/start11/)). Перейти в папку Start11 в репозитории, скопировать иконку кнопки "Пуск" в директорию "C:\Program Files (x86)\Stardock\Start11\StartButtons", скопировать текстуру панели задач (gQPNALP) в директорию "C:\Program Files (x86)\Stardock\Start11\TaskbarTextures". Открыть Start11, перейти в раздел "Резеврное копирование", выбрать пункт "Восстановить настройки", перейти в папку Start11 репозитория и выбрать файл "Vista2024". В случае если кнопка "Пуск" не поменялась и/или текстура панели задач не применилась, то перейти в раздел "Кнопка "Пуск"" и выбрать изображение кнопки "Пуск". Далее перейти в раздел "Панель задач", выбрать пункт "Применить настраиваемую текстуру к панели задач" и выбрать текстуру панели задач.

## Необязательные шаги:

Данные шаги уже являются дополнениями для приближения темы Windows Vista 2024 к настоящей Windows Vista (не целиком естественно).

1. Установка сайдбара (панель гаджетов) - перейти в папку Sidebar, открыть архив и запустить установщик. После установки перейти в "Диспетчер задач" и завершить работу панели гаджетов. Заключительный шагом будет скопировать папку "Windows Sidebar" в директорию "C:\Program Files" и согласиться на замену файлов, после этого перейти в папку Windows Sidebar и запустить "sidebar.exe". С этого момента сайдбар будет всегда запускаться при старте системы.
2. Замена стандартных звуков Windows 11 на звуки из Windows Vista - перейти в папку Media и запустить файл реестра "sound_fix" и согласиться на добавление сведений. После импорта скопировать все звуки в папке Media включая Schemes в директорию "C:\Windows\Media", на замену НЕ СОГЛАШАТЬСЯ. После этого нажать сочетание клавиш "Win + R" и ввести "mmsys.cpl". Далее перейти в "Звуки" и начать заменять звуки, которые указаны в текстовом файле "readme" в папке Media. Нажать кнопку "Применить" и сохранить звуковую схему.
3. Замена звука запуска Windows - перейти в папку Winaero Tweaker, перейти в архив и запустить установщик. В WinAero Tweaker перейти в раздел "Startup Sound", нажать на кнопку "Replace startup sound", перейти в директорию "C:\Windows\Media" и выбрать "Windows_Startup". Поставить галочку на "Enable Startup Sound". WinAero Tweaker предоставляет возможность восстановить классический вид, отключить телеметрию и так далее, но в рамках данной темы такие действия не рассматриваются.
4. Windhawk - полезная программа с модификациями для Windows, потребляет мало системных ресурсов и позволяет кастомизировать Windows. В данной программе следует установить "Legacy File Copy" и "Logon, Logoff & Shutdown Sounds Restored".
5. Winver - перейти в директорию "C:\Windows\Branding\Basebrd", открыть "Свойства" файла "basebrd", перейти в раздел "Безопасность", нажать на кнопку "Дополнительно", сменить владельца на "Администраторы" (ввести в поле "Администраторы", нажать на кнопку "Проверить имена" и нажать "ОК", потом нажать "Применить" и выставить полные права Администраторам и Пользователям. Из папки репозитория "Winver" скопировать файл "basebrd" в директорию "C:\Windows\Branding\Basebrd", на замену согласиться.


